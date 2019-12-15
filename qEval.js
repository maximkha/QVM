function qEvaluator()
{
    var normGNames = ["H", "X", "Y", "Z", "SNOT", "SWP", "SSWP", "CNOT", "CCNOT", "CSWP", "S", "I", "SDAG", "T", "TDAG", "CZ"];
    var normGates = [qGates.Hammard, qGates.PauliX, qGates.PauliY, qGates.PauliZ, qGates.SqrtNot, qGates.Swap, qGates.SqrtSwap, qGates.CNot, qGates.CCNot, qGates.CSwap, qGates.S, qGates.I, qGates.SDagger, qGates.T, qGates.TDagger, qGates.CZ];
    var specialGNames = ["PHASE", "XX", "YY", "ZZ", "RX", "RY", "RZ", "CR", "CRK"];
    var specialGates = [qGates.PhaseShift, qGates.IsingXX, qGates.IsingYY, qGates.IsingZZ, qGates.Rx, qGates.Ry, qGates.Rz, qGates.CR, qGates.CRk];

    this.sim = undefined;

    this.measureObj = undefined;

    this.readLine = function(x)
    {
        var spaces = x.split(" ");

        this.measureObj = undefined;

        if (spaces[0].toLowerCase() == "init")
        {
            this.sim = new QVM(parseInt(spaces[1], 10));
            this.sim.Reset();
        }
        //else if (spaces[0].toLowerCase() == "reset")
        //{
        //    this.sim.Reset();
        //}
        else if (normGNames.includes(spaces[0].toUpperCase()))
        {
            this.sim.Gates.push(normGates[normGNames.indexOf(spaces[0].toUpperCase())]);
            this.sim.qBitSels.push(spaces[1].split(",").map((x) => parseInt(x, 10)));
        }
        else if (specialGNames.includes(spaces[0].toUpperCase()))
        {
            //get angle
            var ang = new Decimal(parseFloat(spaces[1])).mul(new Decimal(-1).acos());
            this.sim.Gates.push(specialGates[specialGNames.indexOf(spaces[0].toUpperCase())](ang));
            this.sim.qBitSels.push(spaces[2].split(",").map((x) => parseInt(x, 10)));
        }
        else if (spaces[0].toLowerCase() == "m")
        {
            this.measureObj = spaces[1].split(",").map((x) => parseInt(x, 10));
        }
        else
        {
            console.log("UKN: " + spaces[0]);
        }
    };

    this.run = function()
    {
        var states = this.sim.Run(false);
        return { States: states, Prob: this.sim.State.GetProbDist(), measure: (this.measureObj == undefined ? undefined : this.sim.MeasureBits(this.measureObj)) };
    };
}