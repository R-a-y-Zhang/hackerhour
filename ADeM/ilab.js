
var Ping = require('ping-lite');


var pingList = []
var ilabMachines =[
  'adapter.cs.rutgers.edu',
  'builder.cs.rutgers.edu',
  'command.cs.rutgers.edu',
  'composite.cs.rutgers.edu',
  'python.cs.rutgers.edu',
  'ls.cs.rutgers.edu',
  'factory.cs.rutgers.edu',
  'state.cs.rutgers.edu',
  'cd.cs.rutgers.edu',
  'mediator.cs.rutgers.edu',
  'utility.cs.rutgers.edu',
  'state.cs.rutgers.edu',
  'facade.cs.rutgers.edu',
  'rm.cs.rutgers.edu',
  'kill.cs.rutgers.edu',
  'cp.cs.rutgers.edu',
  'pwd.cs.rutgers.edu',
  'vi.cs.rutgers.edu',
  'top.cs.rutgers.edu',
  'man.cs.rutgers.edu',
  'less.cs.rutgers.edu',
  'grep.cs.rutgers.edu'
]

for (var i = 0; i < ilabMachines.length; i++){
  var ping = new Ping(ilabMachines[i]);
  pingList.push(ping);
}

module.exports = {
  ilabMachines,
  pingList
};
