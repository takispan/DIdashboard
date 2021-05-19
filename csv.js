const getCSV = require('get-csv');

// South African uses year-month-day order and 24-hour time
const date_format = new Date();
const est_date = date_format.toLocaleString('en-ZA', {timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'});

const year = est_date.substr(6, 4);
const month = est_date.substr(0, 2);
const day = est_date.substr(3, 2);

const csvUrl = "https://api.dmg-inc.com/reports/download/" + year + "/" + month + "/" + day;
console.log(csvUrl);
getCSV( csvUrl )
  .then(rows => console.log(rows));

let members=[]; // Array to store Members Objects

// export the members so we can use it in index
exports.members = members;

// get the csv and assign values to object Member
function get_csv() {
  // gets the csv and logs it
  getCSV(csvUrl)
    .then( data => {
      let e;// Will be a Member Object
      data.forEach((row)=>{
          e=new Member();// New Member Object
          Object.assign(e,row);// Assign json to the new Member
          members.push(e);// Add the Member to the Array
      });
    }).then(()=>{
      // Output the names of the Members
      members.forEach((em)=>{
          console.log(em.id + ": " + em.name + ", " + em.country + ", " + em.joined + ", " + em.cohort);// Invoke the Name getter
      });
    });
    return members;
}

/* Member object
Fields:
- [int] id
- [array] name
- [string] country
- [date] joined
- [array] cohort
- [array] house
- [array] division
- [array] team
- [array] roster
- [array] rank
- [array] position
- [int] posts
- [int] total_rep
- [int] strikes
- [int] hp
- [array] manager
- [array] primary_game
- [array] skill_tier
- [array] vanguard
- [array] last_forum_activity
- [array] last_discord_activity
- [array] rep (daily values)
- [array] events_attended (daily values)
- [array] events_hosted (daily values)
- [array] recruits (daily values)
- [int] reliability
- [array] comp_events_attended (daily values)
- [array] discord_hours (daily values)
*/
class Member {
  set id( id ){
    this._id = id;
  }
  set name( name ){
    this._name = name;
  }
  set country( country ){
    this._country = country;
  }
  set joined( joined ){
    this._joined = joined;
  }
  set cohort( cohort ){
    this._cohort = cohort;
  }
  set house( house ){
    this._house = house;
  }
  set division( division ){
    this._division = division;
  }
  set team( team ){
    this._team = team;
  }
  set roster( roster ){
    this._roster = roster;
  }
  set rank( rank ){
    this._rank = rank;
  }
  set position( position ){
    this._position = position;
  }
  set posts( posts ){
    this._posts = posts;
  }
  set rep( rep ){
    this._rep = rep;
  }
  set strikes( strikes ){
    this._strikes = strikes;
  }
  set hp( hp ){
    this._hp = hp;
  }
  set manager( manager ){
    this._manager = manager;
  }
  set primary_game( primary_game ){
    this._primary_game = primary_game;
  }
  set skill_tier( skill_tier ){
    this._skill_tier = skill_tier;
  }
  set vanguard( vanguard ){
    this._vanguard = vanguard;
  }
  set last_forum_activity( last_forum_activity ){
    this._last_forum_activity = last_forum_activity;
  }
  set last_discord_activity( last_discord_activity ){
    this._last_discord_activity = last_discord_activity;
  }
  set rep_tm( rep_tm ){
    this._rep_tm = rep_tm;
  }
  set rep_lm( rep_lm ){
    this._rep_lm = rep_lm;
  }
  set events_tm( events_tm ){
    this._events_tm = events_tm;
  }
  set events_lm( events_lm ){
    this._events_lm = events_lm;
  }
  set events_hosted_tm( events_hosted_tm ){
    this._events_hosted_tm = events_hosted_tm;
  }
  set events_hosted_lm( events_hosted_lm ){
    this._events_hosted_lm = events_hosted_lm;
  }
  set recruits_tm( recruits_tm ){
    this._recruits_tm = recruits_tm;
  }
  set recruits_lm( recruits_lm ){
    this._recruits_lm = recruits_lm;
  }
  set reliability( reliability ){
    this._reliability = reliability;
  }
  set comp_events_tm( comp_events_tm ){
    this._comp_events_tm = comp_events_tm;
  }
  set comp_events_lm( comp_events_lm ){
    this._comp_events_lm = comp_events_lm;
  }
  set discord_hours_tm( discord_hours_tm ){
    this._discord_hours_tm = discord_hours_tm;
  }
  set discord_hours_lm( discord_hours_lm ){
    this._discord_hours_lm = discord_hours_lm;
  }

  // get
  get id(){
    return this._id;
  }
  get name(){
    return this._name;
  }
  get country(){
    return this._country;
  }
  get joined(){
    return this._joined;
  }
  get cohort(){
    return this._cohort;
  }
  get house(){
    return this._house;
  }
  get division(){
    return this._division;
  }
  get team(){
    return this._team;
  }
  get roster(){
    return this._roster;
  }
  get rank(){
    return this._rank;
  }
  get position(){
    return this._position;
  }
  get posts(){
    return this._posts;
  }
  get rep(){
    return this._rep;
  }
  get strikes(){
    return this._strikes;
  }
  get hp(){
    return this._hp;
  }
  get manager(){
    return this._manager;
  }
  get primary_game(){
    return this._primary_game;
  }
  get skill_tier(){
    return this._skill_tier;
  }
  get vanguards(){
    return this._vanguard;
  }
  get last_forum_activity(){
    return this._last_forum_activity;
  }
  get last_discord_activity(){
    return this._last_discord_activity;
  }
  get rep_tm(){
    return this._rep_tm;
  }
  get rep_lm(){
    return this._rep_lm;
  }
  get events_tm(){
    return this._events_tm;
  }
  get events_lm(){
    return this._events_lm;
  }
  get events_hosted_tm(){
    return this._events_hosted_tm;
  }
  get events_hosted_lm(){
    return this._events_hosted_lm;
  }
  get recruits_tm(){
    return this._recruits_tm;
  }
  get recruits_lm(){
    return this._recruits_lm;
  }
  get reliability(){
    return this._reliability;
  }
  get comp_events_tm(){
    return this._comp_events_tm;
  }
  get comp_events_lm(){
    return this._comp_events_lm;
  }
  get discord_hours_tm(){
    return this._discord_hours_tm;
  }
  get discord_hours_lm(){
    return this._discord_hours_lm;
  }
  constructor(){
  }
}
