// var unitMat = new Matrix(1, 4);
// unitMat.Set(0,0,new Complex(new Decimal(1), new Decimal(0)));
// unitMat.toString();

// var groups = GroupStateVector(unitMat, 1);

function StateVector(nBit)
{
    this.UnitVec = new Matrix(1, Math.pow(2, nBit));
    
    this.SetBinUnitVector = function(states)
    {
        var i = baseArrToN(states);
        this.UnitVec = new Matrix(1, Math.pow(2, nBit));
        this.UnitVec.Set(0, i, 1..Comp());
    };

    this.ZeroBinUnitVector = function()
    {
        this.UnitVec = new Matrix(1, Math.pow(2, nBit));
        this.UnitVec.Set(0, 0, 1..Comp());
    };

    this.Flatten = function()
    {
        return this.UnitVec.CounterRotate90().Vals[0];
    };

    this.GetProbDist = function()
    {
        var compVec = this.UnitVec.VerticleFlatten();
        //var res = compVec.map((x) => x.Abs().Mult(x.Abs()).Abs());
        var res = new Array(compVec.length);
        for (var i = 0; i < res.length; i++)
        {
            res[i] = compVec[i].Sqr();//compVec[i].Abs().Mult(compVec[i].Abs()).Abs()
            if (!res[i].Imaginary.equals(0)) throw "Imaginary Probability!";
            res[i] = res[i].Real.toNumber()
        }
        //if (res.find((x) => !x.Imaginary.equals(0))) throw "Imaginary Probability!";
        return res;//res.map((x) => x.Real.toNumber());
    };

    return this;
}


function QVM(nBit)
{
    this.Gates = [];
    this.qBitSels = [];

    this.State = new StateVector(nBit);

    this.Reset = function()
    {
        //this.State.SetBinUnitVector(padRight0([], nBit));
        this.State.ZeroBinUnitVector();
    };

    this.Run = function(trackStates = true)
    {
        if (this.Gates.length != this.qBitSels.length) throw "Operand length mismatch";
        if (trackStates) console.log(this.State.UnitVec.toString());
        var states = [];
        if (trackStates) states.push(this.State.UnitVec.toString());
        for (var i = 0; i < this.Gates.length; i++)
        {
            var cGate = this.Gates[i];
            var bitSel = this.qBitSels[i];
            // console.log("n");
            // console.log(Math.pow(2, nBit));
            // console.log("bitSel");
            // console.log(bitSel);
            var map = generateGroupMap(Math.pow(2, nBit), bitSel);
            var qPairs = applyGroupMap(map, this.State.Flatten());
            var nQPairs = qPairs.map((x) => cGate.mat.Mult(new Matrix(0, 0).FlatFromArr(x, false)).CounterRotate90().Vals[0]);
            //var nQPairs = qPairs;
            var nState = removeGroupMap(map, nQPairs);
            // console.log("cGate");
            // console.log(cGate);
            // console.log("bitSel");
            // console.log(bitSel);
            // console.log("map");
            // console.log(map);
            // console.log("qPairs");
            // console.log(qPairs);
            // console.log("nQPairs");
            // console.log(nQPairs);
            // console.log(nState);
            this.State.UnitVec = this.State.UnitVec.FlatFromArr(nState, false);
            if (trackStates) console.log(".");
            if (trackStates) console.log(this.State.UnitVec.toString());
            if (trackStates) states.push(this.State.UnitVec.toString());
        }

        return states;
    };

    this.MeasureBits = function (selBits)
    {
        return ApplyCombinationMap(generateCombinationMap(Math.pow(2, nBit), selBits.sort()), this.State.GetProbDist(), true);
    }
}

// var qSim = new QSim(1);
// qSim.Gates.push(qGates.PauliX);
// qSim.qBitSels.push([0]);
// qSim.Reset();
// qSim.Run();

//The states are in the order of:
//var n = 1;
//incArr(Math.pow(2, n)).map((x) => padRight0(nToBaseArr(x, 2), n));