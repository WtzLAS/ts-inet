export type Agent = Name | Normal;
type Name = { port: Agent | null };
export type Normal = { id: number, ports: Agent[] };

export function new_name(): Agent {
    return { port: null };
}

export function new_agent(id: number, ports: Agent[]): Agent {
    return { id, ports };
}

export function is_name(a: Agent): a is Name {
    return "port" in a;
}

export type RuleFn = (machine: Machine, lhs: Normal, rhs: Normal) => void;

export class Machine {
    private eqs: [Agent, Agent][];
    private rules: Map<string, RuleFn>;

    public constructor() {
        this.eqs = [];
        this.rules = new Map();
    }

    public add_eq(lhs: Agent, rhs: Agent) {
        if (!is_name(lhs) && !is_name(rhs) && lhs.ports[0] != rhs.ports[0]) {
            // if lhs and rhs are both Normal
            // their principal ports must match
            throw new Error("invalid eq");
        }
        this.eqs.push([lhs, rhs]);
    }

    public add_rule(id_lhs: number, id_rhs: number, rule: RuleFn) {
        if (this.rules.has([id_lhs, id_rhs].toString())) {
            throw new Error("duplicate rule");
        }
        this.rules.set([id_lhs, id_rhs].toString(), rule);
        if (id_lhs != id_rhs) {
            this.rules.set([id_rhs, id_lhs].toString(), function (m, l, r) {
                rule(m, r, l)
            });
        }
    }

    public run(): [number, number] {
        let op_interaction = 0;
        let op_name = 0;
        for (let eq = this.eqs.pop(); eq != undefined; eq = this.eqs.pop()) {
            let [lhs, rhs] = eq;
            if (is_name(rhs)) {
                if (rhs.port == null) {
                    rhs.port = lhs;
                } else {
                    this.eqs.push([lhs, rhs.port]);
                }
                op_name++;
            } else if (is_name(lhs)) {
                if (lhs.port == null) {
                    lhs.port = rhs;
                } else {
                    this.eqs.push([lhs.port, rhs]);
                }
                op_name++;
            } else {
                let rule = this.rules.get([lhs.id, rhs.id].toString());
                if (rule == undefined) {
                    throw new Error("no rule");
                }
                rule(this, lhs, rhs);
                op_interaction++;
            }
        }
        return [op_interaction, op_name];
    }
}