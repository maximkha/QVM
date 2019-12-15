function PerformanceEval()
{
    for (var i = 0; i < 20; i++)
    {
        var qNum = i + 1;
        var qSim = new QVM(qNum);
        var t0 = performance.now();
        qSim.Reset();
        //qSim.Run();
        var t1 = performance.now();
        var td = t1 - t0;
        console.log(qNum, td);
        if (td > 10) return qNum - 1;
    }
}