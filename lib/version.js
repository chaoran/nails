
module.exports = function() {
  var timestamp = new Date()
    , YYYY = timestamp.getFullYear()
    , MM = timestamp.getMonth()
    , DD = timestamp.getDate()
    , hh = timestamp.getHours()
    , mm = timestamp.getMinutes()
    , ss = timestamp.getSeconds();

  return YYYY + (MM < 10? '0' + MM : MM) + (DD < 10? '0' + DD : DD) +
    (hh < 10? '0' + hh : hh) + (mm < 10? '0' + mm : mm) +
    (ss < 10? '0' + ss : ss);
}
