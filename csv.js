const getCSV = require('get-csv')
const db = require('./database')

// South African uses year-month-day order and 24-hour time
const today = new Date(Date.UTC(2020, 0, 1))
const csv_end_date = new Date(Date.UTC(2020, 0, 11))

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
    await db.insert_csv_log(current_date, new_members.length, updated_members.length, updated_fields.length, exec_time)
  }
  db.pool.end()
}
import_csv(today, csv_end_date)

// get the csv and return members array with Member objects
function get_csv(csvUrl) {
  let members = []
  return getCSV(csvUrl)
    .then((csvData) => {
      let member // Will be a Member Object
      csvData.forEach((row) => {
        member = new Member() // New Member Object
        Object.assign(member, row) // Assign json to the new Member
        if (member.post_count == '') member.post_count = 0
        if (member.rep == '') member.rep = 0
        if (member.strikes == '') member.strikes = 0
        if (member.honors == '') member.honors = 0
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
    if (member.member_id != '') {
      db_member = await is_member_in_db(member.member_id)
      if (member instanceof Member && db_member) {
        // if fields change, call the necessary functions to update the database
        // columns change too, so when CSV is altered come back here!
        if (member.member_name != db_member.name) {
          update_name(member.member_id, member.member_name, db_member.name)
          members_updated.push(member.member_id)
        }
        if (member.country != db_member.country) {
          update_country(member.member_id, member.country, db_member.country)
          members_updated.push(member.member_id)
        }
        if (member.cohort != db_member.cohort) {
          update_cohort(member.member_id, member.cohort, db_member.cohort)
          members_updated.push(member.member_id)
        }
        if (member.division != db_member.division) {
          update_division(member.member_id, member.division, db_member.division)
          members_updated.push(member.member_id)
        }
        if (member.member_rank != db_member.rank) {
          update_rank(member.member_id, member.member_rank, db_member.rank)
          members_updated.push(member.member_id)
        }
        if (member.position != db_member.position) {
          update_position(member.member_id, member.position, db_member.position)
          members_updated.push(member.member_id)
        }
        if (member.post_count != db_member.posts) {
          update_posts(member.member_id, member.post_count, db_member.posts)
          members_updated.push(member.member_id)
        }
        if (member.rep != db_member.rep) {
          update_rep(member.member_id, member.rep, db_member.rep)
          members_updated.push(member.member_id)
        }
        if (member.strikes != db_member.strikes) {
          update_strikes(member.member_id, member.strikes, db_member.strikes)
          members_updated.push(member.member_id)
        }
        if (member.honors != db_member.hp) {
          update_hp(member.member_id, member.honors, db_member.hp)
          members_updated.push(member.member_id)
        }
        // create a date based on csv's field member.last_activity
        // .toDateString() in order to compare only the date parts (csv vs db)
        // that way we don't need to mess with timezones
        member_forum_date = new Date(member.last_activity)
        if (member_forum_date.toDateString() != db_member.last_forum_activity.toDateString()) {
          update_last_forum_activity(member.member_id, member_forum_date.toJSON(), db_member.last_forum_activity.toJSON())
          members_updated.push(member.member_id)
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
  if (member.member_id != '' && member.member_rank != 'Applicant') {
    is_already_in_db = await is_member_in_db(member.member_id)
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

// update division
function update_division(id, division, old_value) {
  db.update_division(id, division)
  let type = db_type_of_changes.indexOf('division')
  db.insert_history(today, id, type, old_value, division)
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

// Member object
class Member {
  constructor() {}
}
