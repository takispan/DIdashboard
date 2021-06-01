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
      text: 'INSERT INTO public."Members"(id, name, country, joined, cohort, division, team, rank, position, posts, rep, strikes, hp, last_forum_activity, latest_events_attended) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *',
      values: [member.member_id, member.member_name, member.country, member.joined, member.cohort, member.division, member.team, member.member_rank, member.position, member.post_count, member.rep, member.strikes, member.honors, member.last_activity, member.events],
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

// daily values
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
  update_division,
  update_team,
  update_rank,
  update_position,
  update_posts,
  update_rep,
  update_strikes,
  update_hp,
  update_last_forum_activity,
  update_latest_events_attended,
  insert_events_attended,
};
