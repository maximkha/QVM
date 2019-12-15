
var qeval = new qEvaluator();
function run()
{
    document.getElementById("in").value.split("\n").map((x) => qeval.readLine(x));
    var res = qeval.run();
    var MinNum = 1e-10;
    var buff = "";
    buff = "States: \n";
    buff += res.States.map((x)=>x.toString()).join(".\n");
    buff += "Probs: ";
    buff += res.Prob.map((x) => Math.abs(x) < MinNum ? 0 : x).join(",");
    if (res.measure != undefined) buff += "\nMeasure: " + res.measure.map((x) => Math.abs(x) < MinNum ? 0 : x).map((x) => x.toString()).join(",");
    document.getElementById("out").value = buff;
}

window.addEventListener("load", onLoad)

function onLoad()
{
    var max = PerformanceEval();
    document.getElementById("warning").innerText = "Autodetected that " + max + " qubits is the max your computer can handle."
}