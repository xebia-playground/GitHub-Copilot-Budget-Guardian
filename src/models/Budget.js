class Budget {

    constructor(username, budget, team, reason) {

        this.username = username;

        this.budget = Number(budget);

        this.team = team || "";

        this.reason = reason || "";

        this.status = "PENDING";

    }

}

module.exports = Budget;