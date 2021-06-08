const getCSV = require('get-csv')
const db = require('./database')

// South African uses year-month-day order and 24-hour time
const csv_start_day = new Date(Date.UTC(2020, 3, 2))
const csv_end_date = new Date(Date.UTC(2020, 8, 5))
let csvDay, today

async function import_csv(start_date, end_date = new Date(start_date.getTime())) {
  let current_date = new Date(start_date.getTime())
  let current_csv_date, csvUrl
  for (start_date; current_date <= end_date; current_date.setDate(current_date.getDate() + 1)) {
    current_csv_date = current_date.toLocaleString('en-ZA', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    today = new Date(current_date.getTime())
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
    const exec_time = (end - start) / 1000
    console.log(exec_time)
    await db.insert_csv_log(current_date, new_members.length, updated_members.length, updated_fields.length, exec_time)
  }
  db.pool.end()
}
import_csv(csv_start_day, csv_end_date)

// get the csv and return members array with Member objects
function get_csv(csvUrl) {
  let members = []
  return getCSV(csvUrl)
    .then((csvData) => {
      let member
      csvData.forEach((row) => {
        member = new Member()
        Object.assign(member, row) // Assign json to the new Member
        if (!member.skill_tier) {
          member.skill_tier = '0'
        }
        else {
          member.skill_tier = member.skill_tier.substr(5, 1)
          if (isNaN(parseInt(member.skill_tier, 10))) member.skill_tier = '0'
        }
        // convert date string in csv to string without time to avoid timezone issues
        if (!member.joined) member.joined = '1970-01-01'
        member.joined = extractDate(new Date(member.joined))
        if (!member.last_forum_activity) member.last_forum_activity = '1970-01-01'
        member.last_forum_activity = extractDate(new Date(member.last_forum_activity))
        if (!member.last_discord_activity || member.last_discord_activity == 'Joined' || member.last_discord_activity == 'Never') member.last_discord_activity = '1970-01-01'
        member.last_discord_activity = extractDate(new Date(member.last_discord_activity))
        members.push(member)
      });
      return members
    })
    .catch(error => console.error(error.stack))
}

// update member fields in database
async function update_and_insert_members(members) {
  let member, is_already_in_db, db_member, member_forum_date, member_discord_date, member_inserted
  let members_updated_and_inserted = [],
    members_updated = [],
    members_inserted = []
  for (let i in members) {
    member = members[i]
    if (member.id) {
      db_member = await is_member_in_db(member.id)
      if (member instanceof Member && db_member) {
        // if fields change, call the necessary functions to update the database
        // columns change too, so when CSV is altered come back here!
        if (member.name && member.name != db_member.name) {
          update_name(member.id, member.name, db_member.name)
          members_updated.push(member.id)
        }
        if (member.country && member.country != db_member.country) {
          update_country(member.id, member.country, db_member.country)
          members_updated.push(member.id)
        }
        if (member.cohort && member.cohort != db_member.cohort) {
          update_cohort(member.id, member.cohort, db_member.cohort)
          members_updated.push(member.id)
        }
        if (member.house && member.house != db_member.house) {
          db.update_house(member.id, member.house, db_member.house)
          members_updated.push(member.id)
        }
        if (member.division && member.division != db_member.division) {
          update_division(member.id, member.division, db_member.division)
          members_updated.push(member.id)
        }
        if (member.team && member.team != db_member.team) {
          update_team(member.id, member.team, db_member.team)
          members_updated.push(member.id)
        }
        if (member.roster && member.roster != db_member.roster) {
          db.update_roster(member.id, member.roster, db_member.roster)
          members_updated.push(member.id)
        }
        if (member.rank && member.rank != db_member.rank) {
          update_rank(member.id, member.rank, db_member.rank)
          members_updated.push(member.id)
        }
        if (member.position && member.position != db_member.position) {
          update_position(member.id, member.position, db_member.position)
          members_updated.push(member.id)
        }
        if (member.posts && member.posts != db_member.posts) {
          update_posts(member.id, member.posts, db_member.posts)
          members_updated.push(member.id)
        }
        if (member.rep && member.rep != db_member.rep) {
          update_rep(member.id, member.rep, db_member.rep)
          members_updated.push(member.id)
        }
        if (member.strikes && member.strikes != db_member.strikes) {
          update_strikes(member.id, member.strikes, db_member.strikes)
          members_updated.push(member.id)
        }
        if (member.hp && member.hp != db_member.hp) {
          update_hp(member.id, member.hp, db_member.hp)
          members_updated.push(member.id)
        }
        if (member.manager && member.manager != db_member.manager) {
          update_manager(member.id, member.manager, db_member.manager)
          members_updated.push(member.id)
        }
        if (member.primary_game && member.primary_game != db_member.primary_game) {
          update_primary_game(member.id, member.primary_game, db_member.primary_game)
          members_updated.push(member.id)
        }
        if (member.skill_tier && member.skill_tier != db_member.skill_tier) {
          update_skill_tier(member.id, member.skill_tier, db_member.skill_tier)
          members_updated.push(member.id)
        }
        if (member.vanguard && member.vanguard != db_member.vanguard) {
          update_vanguard(member.id, member.vanguard, db_member.vanguard)
          members_updated.push(member.id)
        }
        // convert database date to string without time to avoid timezone issues
        db_member.last_forum_activity = extractDate(db_member.last_forum_activity)
        if (member.last_forum_activity && member.last_forum_activity != db_member.last_forum_activity) {
          update_last_forum_activity(member.id, member.last_forum_activity, db_member.last_forum_activity)
          members_updated.push(member.id)
        }
        // same for discord db date
        db_member.last_discord_activity = extractDate(db_member.last_discord_activity)
        if (member.last_discord_activity && member.last_discord_activity != db_member.last_discord_activity) {
          update_last_discord_activity(member.id, member.last_discord_activity, db_member.last_discord_activity)
          members_updated.push(member.id)
        }
        // daily values!
        if (member.rep_tm && member.rep_tm != db_member.latest_rep_earned) {
          update_latest_rep_earned(member.id, member.rep_tm, db_member.latest_rep_earned)
          members_updated.push(member.id)
        }
        if (member.events_tm && member.events_tm != db_member.latest_events_attended) {
          update_latest_events_attended(member.id, member.events_tm, db_member.latest_events_attended)
          members_updated.push(member.id)
        }
        if (member.events_hosted_tm && member.events_hosted_tm != db_member.latest_events_hosted) {
          update_latest_events_hosted(member.id, member.events_hosted_tm, db_member.latest_events_hosted)
          members_updated.push(member.id)
        }
        if (member.recruits_tm && member.recruits_tm != db_member.latest_recruits) {
          update_latest_recruits(member.id, member.recruits_tm, db_member.latest_recruits)
          members_updated.push(member.id)
        }
      } else {
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
  if (member.id && member.rank != 'Applicant') {
    is_already_in_db = await is_member_in_db(member.id)
    if (member instanceof Member && !is_already_in_db) {
      if (!member.name) member.name = 'default_new_member'
      if (!member.country) member.country = 'Country'
      if (!member.joined) member.joined = '1970-01-01'
      if (!member.cohort) member.cohort = 'Cohort'
      if (!member.house) member.house = 'House'
      if (!member.division) member.division = 'Division'
      if (!member.rank) member.rank = 'Rank'
      if (!member.title) member.title = 'Title'
      if (!member.position) member.position = 'Position'
      if (!member.team) member.team = 'Team'
      if (!member.roster) member.roster = 'Roster'
      if (!member.posts) member.posts = '0'
      if (!member.rep) member.rep = '0'
      if (!member.strikes) member.strikes = '0'
      if (!member.hp) member.hp = '0'
      if (!member.manager) member.manager = 'Default Manager'
      if (!member.primary_game) member.primary_game = 'Primary Game'
      if (!member.vanguard) member.vanguard = 'Vanguard'
      if (!member.reliability) member.reliability = '0'
      if (!member.rep_tm) member.rep_tm = '0'
      if (!member.events_tm) member.events_tm = '0'
      if (!member.events_hosted_tm) member.events_hosted_tm = '0'
      if (!member.recruits_tm) member.recruits_tm = '0'
      if (!member.comp_events_tm) member.comp_events_tm = '0'
      if (!member.discord_hours_tm) member.discord_hours_tm = '0'
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

// update manager
function update_manager(id, manager, old_value) {
  db.update_manager(id, manager)
  let type = db_type_of_changes.indexOf('manager')
  db.insert_history(today, id, type, old_value, manager)
}

// update primary_game
function update_primary_game(id, primary_game, old_value) {
  db.update_primary_game(id, primary_game)
  let type = db_type_of_changes.indexOf('primary_game')
  db.insert_history(today, id, type, old_value, primary_game)
}

// update skill_tier
function update_skill_tier(id, skill_tier, old_value) {
  db.update_skill_tier(id, skill_tier)
  let type = db_type_of_changes.indexOf('skill_tier')
  db.insert_history(today, id, type, old_value, skill_tier)
}

// update vanguard
function update_vanguard(id, vanguard, old_value) {
  db.update_vanguard(id, vanguard)
  let type = db_type_of_changes.indexOf('vanguard')
  db.insert_history(today, id, type, old_value, vanguard)
}

// update last_forum_activity
function update_last_forum_activity(id, last_forum_activity, old_value) {
  db.update_last_forum_activity(id, last_forum_activity)
  let type = db_type_of_changes.indexOf('last_forum_activity')
  db.insert_history_activity(today, id, type, old_value, last_forum_activity)
}

// update last_discord_activity
function update_last_discord_activity(id, last_discord_activity, old_value) {
  db.update_last_discord_activity(id, last_discord_activity)
  let type = db_type_of_changes.indexOf('last_discord_activity')
  db.insert_history_activity(today, id, type, old_value, last_discord_activity)
}

// update reliability
function update_reliability(id, reliability, old_value) {
  db.update_reliability(id, reliability)
  let type = db_type_of_changes.indexOf('reliability')
  db.insert_history(today, id, type, old_value, reliability)
}

// daily values
// update rep earned
function update_latest_rep_earned(id, rep_earned, old_value) {
  if (old_value == null) old_value = 0
  let daily_value = rep_earned - old_value
  if (csvDay == '01') {
    daily_value = rep_earned
  }
  db.update_latest_rep_earned(id, rep_earned)
  if (daily_value > 0) {
    db.insert_rep_earned(today, id, daily_value)
  }
}

// update events attended
function update_latest_events_attended(id, events_attended, old_value) {
  if (old_value == null) old_value = 0
  let daily_value = events_attended - old_value
  if (csvDay == '01') {
    daily_value = events_attended
  }
  db.update_latest_events_attended(id, events_attended)
  if (daily_value > 0) {
    db.insert_events_attended(today, id, daily_value)
  }
}

// update events hosted
function update_latest_events_hosted(id, events_hosted, old_value) {
  if (old_value == null) old_value = 0
  let daily_value = events_hosted - old_value
  if (csvDay == '01') {
    daily_value = events_hosted
  }
  db.update_latest_events_hosted(id, events_hosted)
  if (daily_value > 0) {
    db.insert_events_hosted(today, id, daily_value)
  }
}

// update recruits
function update_latest_recruits(id, recruits, old_value) {
  if (old_value == null) old_value = 0
  let daily_value = recruits - old_value
  if (csvDay == '01') {
    daily_value = recruits
  }
  db.update_latest_recruits(id, recruits)
  if (daily_value > 0) {
    db.insert_recruits(today, id, daily_value)
  }
}

// update comp events attended
function update_latest_comp_events_attended(id, comp_events_attended, old_value) {
  if (old_value == null) old_value = 0
  let daily_value = comp_events_attended - old_value
  if (csvDay == '01') {
    daily_value = comp_events_attended
  }
  db.update_latest_comp_events_attended(id, comp_events_attended)
  if (daily_value > 0) {
    db.insert_comp_events_attended(today, id, daily_value)
  }
}

// update discord hours
function update_latest_discord_hours(id, discord_hours, old_value) {
  if (old_value == null) old_value = 0
  let daily_value = discord_hours - old_value
  if (csvDay == '01') {
    daily_value = discord_hours
  }
  db.update_latest_discord_hours(id, discord_hours)
  if (daily_value > 0) {
    db.insert_discord_hours(today, id, daily_value)
  }
}

// extract date from date object and return string (without time)
function extractDate(date) {
  let date_array = [date.getFullYear(), date.getMonth()+1, date.getDate()]
  let month = date_array[1] < 10 ? '0' + date_array[1] : date_array[1]
  let day = date_array[2] < 10 ? '0' + date_array[2] : date_array[2]
  return date_array[0] + '-' + month + '-' + day
}

// Member object
class Member {
  constructor() {}
}
