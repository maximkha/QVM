function incArr(len) 
{
	var res = [];
	for (var i = 0; i < len; i++) 
	{
		res.push(i);
	}
	return res;
}

function baseArrToN(baseArr, base = 2) 
{
	var n = 0;
	for (var i = 0; i < baseArr.length; i++) 
	{
		n += baseArr[i] * Math.pow(base, i);
	}
	return n;
}

function nToBaseArr(n, base = 2) 
{
	var curN = n;
	var res = [];
	while (true) 
	{
		if (curN == 0) return res;
		res.push(curN % base);
		curN = Math.floor(curN / base);
	}
}

function padRight0(bitArr, n) 
{
	var nArr = bitArr.slice();
	var needed = n - bitArr.length;
	if (needed == 0) return bitArr;
	else if (needed < 0) throw "Invalid array length";
	for (var i = 0; i < needed; i++) 
	{
		nArr.push(0);//.unshift(0);
	}
	return nArr;
}

function xorArrs(arr1, arr2) 
{
	if (arr1.length != arr2.length) throw "Length mismatch";
	//var res = [];
	var res = Array(arr1.length);
	for (var i = 0; i < arr1.length; i++) 
	{
		//res.push(arr1[i] ^ arr2[i]);
		res[i] = arr1[i] ^ arr2[i];
	}
	return res;
}

//https://stackoverflow.com/questions/48269545/javascript-remove-multiple-values-of-array-of-objects/48269610
function removeFromArray(original, remove) 
{
	var res = [];
	for (var i = 0; i < original.length; i++) { if (!remove.includes(original[i])) res.push(original[i]); }
	//return original.filter(value => !remove.includes(value));
	return res;
}

function orBitSelArray(arr, bitSel) 
{
	var res = 0;
	for (var i = 0; i < bitSel.length; i++) 
	{
		res |= arr[bitSel[i]];
	}
	return res;
}

function orArray(arr) 
{
	var res = 0;
	for (var i = 0; i < arr.length; i++) 
	{
		res |= arr[i];
	}
	return res;
}

function mapArr(orig, map, preserve = false) 
{
	var res = [];
	if (preserve) res = orig.slice();

	for (var i = 0; i < map.length; i++) 
	{
		if (preserve) res[i] = orig[map[i]];
		else res.push(orig[map[i]]);
	}
	return res;
}


function generateGroupMap(len, selBits) 
{
	var nBit = Math.log2(len);
	if (nBit % 1 != 0) throw "Invalid bit state vector length";
	var allSelectBits = incArr(nBit);

	var allVecBits = incArr(Math.pow(2, nBit))
	var states = allVecBits.map((x) => padRight0(nToBaseArr(x, 2), nBit));
	//1st bit lowest value
	//console.log(states);

	var groups = [];
	var lastLen = states.length;
	while (true) 
	{
		var cPair = states[0];

		var toDelete = [];
		var pairAndNum = [];

		pairAndNum.push([baseArrToN(mapArr(states[0], selBits, false), 2), baseArrToN(states[0], 2)]);

		states.shift();

		for (var i = 0; i < states.length; i++) 
		{
			//check pair
			var pPair = states[i];
			//everything except seleced bits should be the same
			//aka diff for sel bits should be 1 and except should be 0
			var diff = xorArrs(cPair, pPair);
			var isPair = (orBitSelArray(diff, selBits) == 1) && (orBitSelArray(diff, removeFromArray(allSelectBits, selBits)) == 0);
			if (isPair) 
			{
				var mappedBitNum = baseArrToN(mapArr(pPair, selBits, false), 2);
				var realI = baseArrToN(pPair, 2);
				pairAndNum.push([mappedBitNum, realI]);
				//not optimal
				toDelete.push(pPair);
			}
		}

		//console.log(pairAndNum);

		pairAndNum.sort((a, b) => a[0] - b[0]);

		groups.push(pairAndNum.map((x, i) => [x[1], i]));

		states = removeFromArray(states, toDelete);

		if (states.length == lastLen) throw "Endless";
		lastLen = states.length;

		if (states.length == 0) break;
	}

	return {n: len, nGroup: groups.length, bitMap: groups.map((x, i) => [i].concat(x))};
}

function applyGroupMap(map, vec) 
{
	if (vec.length != map.n) throw "Length mismatch";
	var pairs = [];
	for (var i = 0; i < map.nGroup; i++)
	{
		var pair = [];
		for (var j = 0; j < map.bitMap[i].length - 1; j++)
		{
			//console.log(i, j);
			//console.log(map.bitMap[i][j + 1][0]);
			pair.push(vec[map.bitMap[i][j + 1][0]]);
		}
		//console.log(pair);
		pairs.push(pair);
	}
	return pairs;
}

function removeGroupMap(map, pairs) 
{
	if (pairs.length != map.nGroup) throw "Length mismatch";
	var vec = new Array(map.n);
	for (var i = 0; i < map.nGroup; i++)
	{
		for (var j = 0; j < map.bitMap[i].length - 1; j++)
		{
			//console.log(i, j + 1);
			//console.log(map.bitMap[i][j + 1][0]);
			vec[map.bitMap[i][j + 1][0]] = pairs[i][map.bitMap[i][j + 1][1]];
		}
	}
	return vec;
}

//selBits should be sorted by ascending
function generateCombinationMap(len, selBits) 
{
	var nBit = Math.log2(len);
	if (nBit % 1 != 0) throw "Invalid bit state vector length";
	var allSelectBits = incArr(nBit);

	var allVecBits = incArr(Math.pow(2, nBit))
	var states = allVecBits.map((x) => padRight0(nToBaseArr(x, 2), nBit));

	var Pairs = [];
	var lastLen = states.length;
	while (true)
	{
		var res = [];
		var cPair = states[0];
		res.push(baseArrToN(cPair, 2));
		states.shift();
		var toDelete = [];

		for (var i = 0; i < states.length; i++)
		{
			var pPair = states[i];
			//var isPair = orArray(xorArrs(mapArr(cPair, selBits, false), mapArr(pPair, selBits, false))) == 0;
			if (orArray(xorArrs(mapArr(cPair, selBits, false), mapArr(pPair, selBits, false))) == 0)//isPair)
			{
				res.push(baseArrToN(pPair, 2));
				toDelete.push(pPair);
			}
		}
		Pairs.push([baseArrToN(mapArr(cPair, selBits, false), 2), res]);
		states = removeFromArray(states, toDelete);

		if (states.length == lastLen) throw "Endless";
		lastLen = states.length;

		if (lastLen == 0) break;
	}

	Pairs.sort((a, b) => a[0] - b[0]);
	return {n:len, sB: selBits, bitMap: Pairs};
}

//Non-reversable operation
function ApplyCombinationMap(map, arr, pad = true)
{
	if (arr.length != map.n) throw "Length mismatch";
	//If pad is true, it will return the bit array as if bits outside of bitsel were read as 0
	var retMat = new Array(map.bitMap.length);
	if (pad) retMat = new Array(arr.length).fill(new Decimal(0));//new Complex(0, 0));
	for (var i = 0; i < map.bitMap.length; i++)
	{
		var sum = new Decimal(0);//new Complex(0, 0);
		for (var j = 0; j < map.bitMap[i][1].length; j++)
		{
			//console.log("adding: " + arr[map.bitMap[i][1][j]].toString());
			sum = sum.add(arr[map.bitMap[i][1][j]]);//Add(arr[map.bitMap[i][1][j]]);
		}
		if (pad) retMat[map.bitMap[i][0]] = sum;
		else retMat[i] = sum;
	}
	return retMat;
}

// var n = 8;
// var selBit = [0,1];
// var map = generateGroupMap(n, selBit);
// var mapped = applyGroupMap(map, incArr(n));
// console.log(mapped);
// var unmapped = removeGroupMap(map, mapped);
// console.log(unmapped);