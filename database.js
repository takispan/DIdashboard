require('dotenv').config()
const {
  Pool,
  Client
} = require('pg')

// Create new pool specifying dotenv variables
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASS,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
})

// QUERIES
// postgres automaticall converts uppercase characters to lowercase,
// so in order to use a table or column with uppercase characters
// we enclose the word with quotes
async function insert_member(member) {
  // async/await
  try {
    const query = {
      name: 'insert-member',
      text: 'INSERT INTO public."Members"(id, name, country, joined, cohort, house, division, team, roster, rank, position, posts, rep, strikes, hp, last_forum_activity, latest_rep_earned, latest_events_attended, latest_events_hosted, latest_recruits) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *',
      values: [member.id, member.name, member.country, member.joined, member.cohort, member.house, member.division, member.team, member.roster, member.rank, member.position, member.posts, member.rep, member.strikes, member.hp, member.last_act, member.rep_tm, member.ev_tm, member.ev_hosted_tm, member.rec_tm],
    }
    const res = await pool.query(query)
    return res.rows[0]
  } catch (err) {
    console.log(err.stack)
    console.log("Error (insert_member)")
  }
}

async function get_members() {
  // async/await
  try {
    const query = {
      name: 'get-member-by-id',
      text: 'SELECT * FROM public."Members"',
    }
    const res = await pool.query(query)
    return res.rows;
  } catch (err) {
    console.log(err.stack)
    console.log("Error (select_members)")
  }
}

async function get_member_by_id(id) {
  // async/await
  try {
    const query = {
      name: 'get-member-by-id',
      text: 'SELECT * FROM public."Members" WHERE id=$1',
      values: [id],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (select_member_by_id)")
  }
}

// insert member history
async function insert_history(today, id, type, old_value, new_value) {
  // async/await
  try {
    const query = {
      name: 'insert-history',
      text: 'INSERT INTO public."Member_history"(date, type, old_value, new_value, "memberID") VALUES($1, $2, $3, $4, $5) RETURNING *',
      values: [today, type, old_value, new_value, id],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (insert_history)")
  }
}

// update name
async function update_name(id, name) {
  try {
    const query = {
      name: 'update-name',
      text: 'UPDATE public."Members" SET name=$2 WHERE id=$1',
      values: [id, name],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_name)")
  }
}

// update country
async function update_country(id, country) {
  try {
    const query = {
      name: 'update-country',
      text: 'UPDATE public."Members" SET country=$2 WHERE id=$1',
      values: [id, country],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_country)")
  }
}

// update cohort
async function update_cohort(id, cohort) {
  try {
    const query = {
      name: 'update-cohort',
      text: 'UPDATE public."Members" SET cohort=$2 WHERE id=$1',
      values: [id, cohort],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_cohort)")
  }
}

// update house
async function update_house(id, house) {
  try {
    const query = {
      name: 'update-house',
      text: 'UPDATE public."Members" SET house=$2 WHERE id=$1',
      values: [id, house],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_house)")
  }
}

// update division
async function update_division(id, division) {
  try {
    const query = {
      name: 'update-division',
      text: 'UPDATE public."Members" SET division=$2 WHERE id=$1',
      values: [id, division],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_division)")
  }
}

// update team
async function update_team(id, team) {
  try {
    const query = {
      name: 'update-team',
      text: 'UPDATE public."Members" SET team=$2 WHERE id=$1',
      values: [id, team],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_team)")
  }
}

// update roster
async function update_roster(id, roster) {
  try {
    const query = {
      name: 'update-roster',
      text: 'UPDATE public."Members" SET roster=$2 WHERE id=$1',
      values: [id, roster],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error bish (update_roster)")
  }
}

// update rank
async function update_rank(id, rank) {
  try {
    const query = {
      name: 'update-rank',
      text: 'UPDATE public."Members" SET rank=$2 WHERE id=$1',
      values: [id, rank],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_rank)")
  }
}

// update position
async function update_position(id, position) {
  try {
    const query = {
      name: 'update-position',
      text: 'UPDATE public."Members" SET position=$2 WHERE id=$1',
      values: [id, position],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_position)")
  }
}

// update posts
async function update_posts(id, posts) {
  try {
    const query = {
      name: 'update-posts',
      text: 'UPDATE public."Members" SET posts=$2 WHERE id=$1',
      values: [id, posts],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_posts)")
  }
}

// update rep
async function update_rep(id, rep) {
  try {
    const query = {
      name: 'update-rep',
      text: 'UPDATE public."Members" SET rep=$2 WHERE id=$1',
      values: [id, rep],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_rep)")
  }
}

// update strikes
async function update_strikes(id, strikes) {
  try {
    const query = {
      name: 'update-strikes',
      text: 'UPDATE public."Members" SET strikes=$2 WHERE id=$1',
      values: [id, strikes],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_strikes)")
  }
}

// update hp
async function update_hp(id, hp) {
  try {
    const query = {
      name: 'update-hp',
      text: 'UPDATE public."Members" SET hp=$2 WHERE id=$1',
      values: [id, hp],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_hp)")
  }
}

// update manager
async function update_manager(id, manager) {
  try {
    const query = {
      name: 'update-manager',
      text: 'UPDATE public."Members" SET manager=$2 WHERE id=$1',
      values: [id, manager],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_manager)")
  }
}

// update primary_game
async function update_primary_game(id, primary_game) {
  try {
    const query = {
      name: 'update-primary_game',
      text: 'UPDATE public."Members" SET primary_game=$2 WHERE id=$1',
      values: [id, primary_game],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_primary_game)")
  }
}

// update skill_tier
async function update_skill_tier(id, skill_tier) {
  try {
    const query = {
      name: 'update-skill_tier',
      text: 'UPDATE public."Members" SET skill_tier=$2 WHERE id=$1',
      values: [id, skill_tier],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_skill_tier)")
  }
}

// update vanguard
async function update_vanguard(id, vanguard) {
  try {
    const query = {
      name: 'update-vanguard',
      text: 'UPDATE public."Members" SET vanguard=$2 WHERE id=$1',
      values: [id, vanguard],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_vanguard)")
  }
}

// update last_forum_activity
async function update_last_forum_activity(id, last_forum_activity) {
  try {
    const query = {
      name: 'update-last_forum_activity',
      text: 'UPDATE public."Members" SET last_forum_activity=$2 WHERE id=$1',
      values: [id, last_forum_activity],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_last_forum_activity)")
  }
}

// update last_discord_activity
async function update_last_discord_activity(id, last_discord_activity) {
  try {
    const query = {
      name: 'update-last_discord_activity',
      text: 'UPDATE public."Members" SET last_discord_activity=$2 WHERE id=$1',
      values: [id, last_discord_activity],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_last_discord_activity)")
  }
}

// update reliability
async function update_reliability(id, reliability) {
  try {
    const query = {
      name: 'update-reliability',
      text: 'UPDATE public."Members" SET reliability=$2 WHERE id=$1',
      values: [id, reliability],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_reliability)")
  }
}

// update latest_rep_earned
async function update_latest_rep_earned(id, latest_rep_earned) {
  try {
    const query = {
      name: 'update-latest_rep_earned',
      text: 'UPDATE public."Members" SET latest_rep_earned=$2 WHERE id=$1',
      values: [id, latest_rep_earned],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_latest_rep_earned)")
  }
}

// update latest_events_attended
async function update_latest_events_attended(id, latest_events_attended) {
  try {
    const query = {
      name: 'update-latest_events_attended',
      text: 'UPDATE public."Members" SET latest_events_attended=$2 WHERE id=$1',
      values: [id, latest_events_attended],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_latest_events_attended)")
  }
}

// update latest_events_hosted
async function update_latest_events_hosted(id, latest_events_hosted) {
  try {
    const query = {
      name: 'update-latest_events_hosted',
      text: 'UPDATE public."Members" SET latest_events_hosted=$2 WHERE id=$1',
      values: [id, latest_events_hosted],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_latest_events_hosted)")
  }
}

// update latest_recruits
async function update_latest_recruits(id, latest_recruits) {
  try {
    const query = {
      name: 'update-latest_recruits',
      text: 'UPDATE public."Members" SET latest_recruits=$2 WHERE id=$1',
      values: [id, latest_recruits],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_latest_recruits)")
  }
}

// update latest_comp_events_attended
async function update_latest_comp_events_attended(id, latest_comp_events_attended) {
  try {
    const query = {
      name: 'update-latest_comp_events_attended',
      text: 'UPDATE public."Members" SET latest_comp_events_attended=$2 WHERE id=$1',
      values: [id, latest_comp_events_attended],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_latest_comp_events_attended)")
  }
}

// update latest_discord_hours
async function update_latest_discord_hours(id, latest_discord_hours) {
  try {
    const query = {
      name: 'update-latest_discord_hours',
      text: 'UPDATE public."Members" SET latest_discord_hours=$2 WHERE id=$1',
      values: [id, latest_discord_hours],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (update_latest_discord_hours)")
  }
}

// daily values
// insert rep_earned
async function insert_rep_earned(today, id, daily_value) {
  try {
    const query = {
      name: 'insert-rep_earned',
      text: 'INSERT INTO public."Rep_earned"(date, value, "memberID") VALUES($1, $2, $3) RETURNING *',
      values: [today, daily_value, id],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (insert_rep_earned)")
  }
}

// insert events_attended
async function insert_events_attended(today, id, daily_value) {
  try {
    const query = {
      name: 'insert-events_attended',
      text: 'INSERT INTO public."Events_attended"(date, value, "memberID") VALUES($1, $2, $3) RETURNING *',
      values: [today, daily_value, id],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (insert_events_attended)")
  }
}

// insert events_hosted
async function insert_events_hosted(today, id, daily_value) {
  try {
    const query = {
      name: 'insert-events_hosted',
      text: 'INSERT INTO public."Events_hosted"(date, value, "memberID") VALUES($1, $2, $3) RETURNING *',
      values: [today, daily_value, id],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (insert_events_hosted)")
  }
}

// insert recruits
async function insert_recruits(today, id, daily_value) {
  try {
    const query = {
      name: 'insert-recruits',
      text: 'INSERT INTO public."Recruits"(date, value, "memberID") VALUES($1, $2, $3) RETURNING *',
      values: [today, daily_value, id],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (insert_recruits)")
  }
}

// insert comp_events_attended
async function insert_comp_events_attended(today, id, daily_value) {
  try {
    const query = {
      name: 'insert-comp_events_attended',
      text: 'INSERT INTO public."Comp_events_attended"(date, value, "memberID") VALUES($1, $2, $3) RETURNING *',
      values: [today, daily_value, id],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (insert_comp_events_attended)")
  }
}

// insert discord_hours
async function insert_discord_hours(today, id, daily_value) {
  try {
    const query = {
      name: 'insert-discord_hours',
      text: 'INSERT INTO public."Discord_hours"(date, value, "memberID") VALUES($1, $2, $3) RETURNING *',
      values: [today, daily_value, id],
    }
    const res = await pool.query(query)
    return res.rows[0];
  } catch (err) {
    console.log(err.stack)
    console.log("Error (insert_discord_hours)")
  }
}

// export
module.exports = {
  pool,
  insert_member,
  get_members,
  get_member_by_id,
  insert_history,
  update_name,
  update_country,
  update_cohort,
  update_house,
  update_division,
  update_team,
  update_roster,
  update_rank,
  update_position,
  update_posts,
  update_rep,
  update_strikes,
  update_hp,
  update_manager,
  update_primary_game,
  update_skill_tier,
  update_vanguard,
  update_last_forum_activity,
  update_last_discord_activity,
  update_reliability,
  update_latest_rep_earned,
  update_latest_events_attended,
  update_latest_events_hosted,
  update_latest_recruits,
  update_latest_comp_events_attended,
  update_latest_discord_hours,
  insert_rep_earned,
  insert_events_attended,
  insert_events_hosted,
  insert_recruits,
  insert_comp_events_attended,
  insert_discord_hours,
};
