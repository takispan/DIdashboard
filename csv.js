const getCSV = require('get-csv')
const db = require('./database')

// South African uses year-month-day order and 24-hour time
const today = new Date(Date.UTC(2020, 3, 1))
const csv_end_date = new Date(Date.UTC(2020, 3, 1))
let csvDay

async function import_csv(start_date, end_date = new Date(start_date.getTime())) {
  let current_date = new Date(start_date.getTime())
  let current_csv_date, csvUrl
  for (start_date; current_date <= end_date; current_date.setDate(current_date.getDate()+1)) {
    current_csv_date = current_date.toLocaleString('en-ZA', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    csvUrl = "https://api.dmg-inc.com/reports/download/" + current_csv_date;
    csvDay = csvUrl.substr(49)
    console.log("Fetching CSV [" + current_csv_date + "]...")
    const start = new Date()
    const members = await get_csv(csvUrl)
    console.log("Got CSV!")
    console.log("Inserting & updating members in database...")
    const all_db_changes = await update_and_insert_members(members)
    const new_members = all_db_changes[0]
    const updated_fields = all_db_changes[1]
    const updated_members = [...new Set(updated_fields)];
    console.log("Done!")
    console.log("Inserted " + new_members.length + " new members into database")
    console.log("Updated " + updated_fields.length + " fields from " + updated_members.length + " members in database")
    const end = new Date()
    const exec_time = (end - start)/1000
    console.log(exec_time)
    await db.insert_csv_log(today, new_members.length, updated_members.length, updated_fields.length, exec_time)
  }
  db.pool.end()
}
import_csv(today)

// get the csv and return members array with Member objects
function get_csv(csvUrl) {
  let members = []
  return getCSV(csvUrl)
    .then((csvData) => {
      let member // Will be a Member Object
      csvData.forEach((row) => {
        member = new Member() // New Member Object
        Object.assign(member, row) // Assign json to the new Member
        if (member.posts == '') member.posts = 0
        if (member.rep == '') member.rep = 0
        if (member.strikes == '') member.strikes = 0
        if (member.hp == '') member.hp = 0
        if (member.rep_tm == '') member.rep_tm = 0
        if (member.ev_tm == '') member.ev_tm = 0
        if (member.ev_hosted_tm == '') member.ev_hosted_tm = 0
        if (member.rec_tm == '') member.rec_tm = 0
        members.push(member)
      });
      return members
    })
    .catch(error => console.error(error.stack))
}

// update member fields in database
async function update_and_insert_members(members) {
  let member, is_already_in_db, db_member, member_forum_date, member_inserted
  let members_updated_and_inserted = [], members_updated = [], members_inserted = []
  for (let i in members) {
    member = members[i]
    if (member.id != '') {
      db_member = await is_member_in_db(member.id)
      if (member instanceof Member && db_member) {
        // if fields change, call the necessary functions to update the database
        // columns change too, so when CSV is altered come back here!
        if (member.name != db_member.name) {
          update_name(member.id, member.name, db_member.name)
          members_updated.push(member.id)
        }
        if (member.country != db_member.country) {
          update_country(member.id, member.country, db_member.country)
          members_updated.push(member.id)
        }
        if (member.cohort != db_member.cohort) {
          update_cohort(member.id, member.cohort, db_member.cohort)
          members_updated.push(member.id)
        }
        if (member.house != db_member.house) {
          db.update_house(member.id, member.house, db_member.house)
          members_updated.push(member.id)
        }
        if (member.division != db_member.division) {
          update_division(member.id, member.division, db_member.division)
          members_updated.push(member.id)
        }
        if (member.team != db_member.team) {
          update_team(member.id, member.team, db_member.team)
          members_updated.push(member.id)
        }
        if (member.roster != db_member.roster) {
          db.update_roster(member.id, member.roster, db_member.roster)
          members_updated.push(member.id)
        }
        if (member.rank != db_member.rank) {
          update_rank(member.id, member.rank, db_member.rank)
          members_updated.push(member.id)
        }
        if (member.position != db_member.position) {
          update_position(member.id, member.position, db_member.position)
          members_updated.push(member.id)
        }
        if (member.posts != db_member.posts) {
          update_posts(member.id, member.posts, db_member.posts)
          members_updated.push(member.id)
        }
        if (member.rep != db_member.rep) {
          update_rep(member.id, member.rep, db_member.rep)
          members_updated.push(member.id)
        }
        if (member.strikes != db_member.strikes) {
          update_strikes(member.id, member.strikes, db_member.strikes)
          members_updated.push(member.id)
        }
        if (member.hp != db_member.hp) {
          update_hp(member.id, member.hp, db_member.hp)
          members_updated.push(member.id)
        }
        // create a date based on csv's field member.last_act
        // .toDateString() in order to compare only the date parts (csv vs db)
        // that way we don't need to mess with timezones
        member_forum_date = new Date(member.last_act)
        if (member_forum_date.toDateString() != db_member.last_forum_activity.toDateString()) {
          update_last_forum_activity(member.id, member_forum_date.toJSON(), db_member.last_forum_activity.toJSON())
          members_updated.push(member.id)
        }
        // daily values!
        if (member.rep_tm != db_member.latest_rep_earned) {
          update_latest_rep_earned(member.id, member.rep_tm, db_member.latest_rep_earned)
          members_updated.push(member.id)
        }
        if (member.ev_tm != db_member.latest_events_attended) {
          update_latest_events_attended(member.id, member.ev_tm, db_member.latest_events_attended)
          members_updated.push(member.id)
        }
        if (member.ev_hosted_tm != db_member.latest_events_hosted) {
          update_latest_events_hosted(member.id, member.ev_hosted_tm, db_member.latest_events_hosted)
          members_updated.push(member.id)
        }
        if (member.rec_tm != db_member.latest_recruits) {
          update_latest_recruits(member.id, member.rec_tm, db_member.latest_recruits)
          members_updated.push(member.id)
        }
      }
      else {
        member_inserted = await insert_member_into_db(member)
        if (member_inserted) {
          members_inserted.push(member_inserted)
        }
      }
    }
  }
  members_updated_and_inserted.push(members_inserted)
  members_updated_and_inserted.push(members_updated)
  return members_updated_and_inserted
}

// insert members in database
async function insert_member_into_db(member) {
  let is_already_in_db, db_member
  if (member.id != '' && member.rank != 'Applicant') {
    is_already_in_db = await is_member_in_db(member.id)
    if (member instanceof Member && !is_already_in_db) {
      db_member = await db.insert_member(member)
    }
  }
  return db_member
}

// check if member exists in database
async function is_member_in_db(id) {
  let db_member = await db.get_member_by_id(id)
  return db_member
}

// array to be used for member_history table in database
const db_type_of_changes = ['name', 'country', 'cohort', 'house', 'division', 'team', 'roster', 'rank', 'position', 'posts', 'rep', 'strikes', 'hp', 'manager', 'primary_game', 'skill_tier', 'vanguard', 'last_forum_activity', 'last_discord_activity', 'reliability']

/**
 *  update member fields
**/
// update name
function update_name(id, name, old_value) {
  db.update_name(id, name)
  let type = db_type_of_changes.indexOf('name')
  db.insert_history(today, id, type, old_value, name)
}

// update country
function update_country(id, country, old_value) {
  db.update_country(id, country)
  let type = db_type_of_changes.indexOf('country')
  db.insert_history(today, id, type, old_value, country)
}

// update cohort
function update_cohort(id, cohort, old_value) {
  db.update_cohort(id, cohort)
  let type = db_type_of_changes.indexOf('cohort')
  db.insert_history(today, id, type, old_value, cohort)
}

// update house
function update_house(id, house, old_value) {
  db.update_house(id, house)
  let type = db_type_of_changes.indexOf('house')
  db.insert_history(today, id, type, old_value, house)
}

// update division
function update_division(id, division, old_value) {
  db.update_division(id, division)
  let type = db_type_of_changes.indexOf('division')
  db.insert_history(today, id, type, old_value, division)
}

// update team
function update_team(id, team, old_value) {
  db.update_team(id, team)
  let type = db_type_of_changes.indexOf('team')
  db.insert_history(today, id, type, old_value, team)
}

// update roster
function update_roster(id, roster, old_value) {
  db.update_roster(id, roster)
  let type = db_type_of_changes.indexOf('roster')
  db.insert_history(today, id, type, old_value, roster)
}

// update rank
function update_rank(id, rank, old_value) {
  db.update_rank(id, rank)
  let type = db_type_of_changes.indexOf('rank')
  db.insert_history(today, id, type, old_value, rank)
}

// update position
function update_position(id, position, old_value) {
  db.update_position(id, position)
  let type = db_type_of_changes.indexOf('position')
  db.insert_history(today, id, type, old_value, position)
}

// update posts
function update_posts(id, posts, old_value) {
  db.update_posts(id, posts)
  let type = db_type_of_changes.indexOf('posts')
  db.insert_history(today, id, type, old_value, posts)
}

// update rep
function update_rep(id, rep, old_value) {
  db.update_rep(id, rep)
  let type = db_type_of_changes.indexOf('rep')
  db.insert_history(today, id, type, old_value, rep)
}

// update strikes
function update_strikes(id, strikes, old_value) {
  db.update_strikes(id, strikes)
  let type = db_type_of_changes.indexOf('strikes')
  db.insert_history(today, id, type, old_value, strikes)
}

// update hp
function update_hp(id, hp, old_value) {
  db.update_hp(id, hp)
  let type = db_type_of_changes.indexOf('hp')
  db.insert_history(today, id, type, old_value, hp)
}

// update last_forum_activity
function update_last_forum_activity(id, last_forum_activity, old_value) {
  db.update_last_forum_activity(id, last_forum_activity)
  let type = db_type_of_changes.indexOf('last_forum_activity')
  db.insert_history(today, id, type, old_value, last_forum_activity)
}

// daily values
// update rep earned
function update_latest_rep_earned(id, rep_earned, old_value) {
  if (old_value == null) old_value = 0
  let daily_value = rep_earned - old_value
  if ( csvDay == '01' ) {
    daily_value = rep_earned
  }
  db.update_latest_rep_earned(id, rep_earned)
  if (daily_value > 0 ) {
    db.insert_rep_earned(today, id, daily_value)
  }
}

// update events attended
function update_latest_events_attended(id, events_attended, old_value) {
  if (old_value == null) old_value = 0
  let daily_value = events_attended - old_value
  if ( csvDay == '01' ) {
    daily_value = events_attended
  }
  db.update_latest_events_attended(id, events_attended)
  if (daily_value > 0 ) {
    db.insert_events_attended(today, id, daily_value)
  }
}

// update events hosted
function update_latest_events_hosted(id, events_hosted, old_value) {
  if (old_value == null) old_value = 0
  let daily_value = events_hosted - old_value
  if ( csvDay == '01' ) {
    daily_value = events_hosted
  }
  db.update_latest_events_hosted(id, events_hosted)
  if (daily_value > 0 ) {
    db.insert_events_hosted(today, id, daily_value)
  }
}

// update recruits
function update_latest_recruits(id, recruits, old_value) {
  if (old_value == null) old_value = 0
  let daily_value = recruits - old_value
  if ( csvDay == '01' ) {
    daily_value = recruits
  }
  db.update_latest_recruits(id, recruits)
  if (daily_value > 0 ) {
    db.insert_recruits(today, id, daily_value)
  }
}

// Member object
class Member {
  constructor() {}
}
