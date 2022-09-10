import { Agent, is_name, Machine, new_agent, new_name } from "./core";

const Z_ID = 0;
const S_ID = 1;
const ADD_ID = 2;

function add_number(machine: Machine, n: number): Agent {
    let name = new_name();
    let last_port = name;
    while (n > 0) {
        let aux_port = new_name();
        machine.add_eq(new_agent(S_ID, [last_port, aux_port]), last_port);
        last_port = aux_port;
        n--;
    }
    machine.add_eq(new_agent(Z_ID, [last_port]), last_port);
    return name;
}

let machine = new Machine();

machine.add_rule(ADD_ID, S_ID, function (m, l, r) {
    let name = new_name();
    m.add_eq(new_agent(ADD_ID, [r.ports[1], l.ports[1], name]), r.ports[1]);
    m.add_eq(new_agent(S_ID, [l.ports[2], name]), l.ports[2]);
});

machine.add_rule(ADD_ID, Z_ID, function (m, l, r) {
    m.add_eq(l.ports[1], l.ports[2]);
});

let x = add_number(machine, 10000);
let y = add_number(machine, 10000);
let o = new_name();

machine.add_eq(new_agent(ADD_ID, [x, y, o]), x);

console.log(machine.run());

let tmp = 0;

while (true) {
    if (is_name(o)) {
        if (o.port == null) {
            throw new Error("inconsistent state");
        } else {
            o = o.port;
        }
    } else {
        if (o.id == S_ID) {
            tmp++;
            o = o.ports[1];
        } else if (o.id == Z_ID) {
            break;
        } else {
            throw new Error("inconsistent state");
        }
    }
}

console.log(tmp);