function Complex(real, imaginary)
{
    if (typeof real === "number") real = new Decimal(real);
    if (typeof imaginary === "number") imaginary = new Decimal(imaginary);

    this.Real = real;
    this.Imaginary = imaginary;

    this.Sub = function(comp)
    {
        return new Complex(this.Real.sub(comp.Real), this.Imaginary.sub(comp.Imaginary));
    };

    this.Add = function(comp)
    {
        return new Complex(this.Real.add(comp.Real), this.Imaginary.add(comp.Imaginary));
    };

    this.Mult = function(comp)
    {
        return new Complex(this.Real.mul(comp.Real).sub(this.Imaginary.mul(comp.Imaginary)), this.Real.mul(comp.Imaginary).add(comp.Real.mul(this.Imaginary)));
    };

    this.Inverse = function()
    {
        return new Complex(new Decimal(1).div(this.Real), new Decimal(1).div(this.Imaginary));
    };

    this.Negate = function()
    {
        return new Complex(this.Real.negated(), this.Imaginary.negated());
    };

    this.Div = function(comp)
    {
        return this.Mult(this, comp.Inverse());
    };

    this.Abs = function()
    {
        return new Complex(this.Real.abs(), this.Imaginary.abs());
    }

    this.toString = function()
    {
        return this.Real.toNumber() + "+" + this.Imaginary.toNumber() + "i";
    };

    this.Sqr = function()
    {
        //return new Complex(this.Real.pow(2).sub(this.Imaginary.pow(2)), this.Imaginary.mul(this.Real).mul(2));
        return new Complex(this.Real.mul(this.Real).sub(this.Imaginary.mul(this.Imaginary)), this.Imaginary.mul(this.Real).mul(2));
    }

    this.Clone = function()
    {
        return new Complex(this.Real, this.Imaginary);
    };

    return this;
}

Number.prototype.Comp = function()
{
    var a = Number(this);
    //console.log(a);
    //console.log(new Decimal(a));
    return new Complex(new Decimal(a), new Decimal(0));
}

//Accepts only (Decimal) objects
//https://en.wikipedia.org/wiki/Euler%27s_formula
function eulerFormula(theta)
{
    return new Complex(theta.cos(), theta.sin());
}

function invEulerFormula(comp)
{
    return new Decimal(comp.Imaginary.div(comp.Real).atan());
}

function Matrix(width, height, opt = true)
{
    //TODO: implement constructor

    this.Width = width;
    this.Height = height;

    this.Rotated = false;
    if (opt && this.Height > this.Width) this.Rotated = true;

    if (!this.Rotated)
    {
        this.Vals = new Array(this.Height);
        var h = this.Height;
        for (var i = 0; i < h; i++)
        {
            var row = new Array(this.Width);
            var w = this.Width;
            for (var j = 0; j < w; j++) row[j] = new Complex(new Decimal(0), new Decimal(0));
            this.Vals[i] = row;
            //this.Vals[i] = [...row];
            //this.Vals[i] = //row.slice();
            //this.Vals[i] = Array(width).fill(new Complex(new Decimal(0), new Decimal(0)));
        }
    }
    else
    {
        this.Vals = new Array(this.Width);
        var w = this.Width;
        for (var i = 0; i < w; i++)
        {
            var row = new Array(this.Height);
            var h = this.Height;
            for (var j = 0; j < h; j++) row[j] = new Complex(new Decimal(0), new Decimal(0));
            this.Vals[i] = row;
            //this.Vals[i] = [...row];
            //this.Vals[i] = //row.slice();
            //this.Vals[i] = Array(width).fill(new Complex(new Decimal(0), new Decimal(0)));
        }
    }
    

    this.Set = function(i, j, v)
    {
        if (this.Rotated) { this.Vals[i][j] = v; return; };
        this.Vals[j][i] = v;
    };

    this.Get = function(i, j)
    {
        if (this.Rotated) return this.Vals[i][j];
        return this.Vals[j][i];
    };

    this.Mult = function(mat)
    {
        //if (this.Width != mat.Height) throw "Dim Mismatch";
        var res = new Matrix(mat.Width, this.Height);
        //console.log(res);
        for (var i = 0; i < this.Height; i++)
        {
            for (var j = 0; j < mat.Width; j++)
            {
                var sum = new Complex(new Decimal(0), new Decimal(0));
                for (var k = 0; k < this.Width; k++)
                {
                    var a = this.Get(k, i);
                    var b = mat.Get(j, k);
                    sum = sum.Add(a.Mult(b));
                }
                //console.log(j, i, sum.toString());
                res.Set(j, i, sum);
            }
        }

        return res;
    };

    this.Rotate90 = function()
    {
        var res = new Matrix(this.Height, this.Width);

        for (var i = 0; i < this.Width; i++)
        {
            for (var j = 0; j < this.Height; j++)
            {
                res.Set(this.Height - j - 1, i, this.Get(i, j));
            }
        }

        return res;
    };

    this.CounterRotate90 = function()
    {
        var res = new Matrix(this.Height, this.Width);

        for (var i = 0; i < this.Width; i++)
        {
            for (var j = 0; j < this.Height; j++)
            {
                res.Set(j, this.Width - i - 1, this.Get(i, j));
            }
        }

        return res;
    };

    this.VerticleFlatten = function()
    {
        if (this.Rotated) return this.Vals[0];
        var res = new Array(this.Height);
        for (var i = 0; i < this.Height; i++) res[i] = this.Get(0, i);
        return res;
    };

    this.toString = function()
    {
        var ret = "";
        for (var i = 0; i < this.Height; i++)
        {
            var str = "";
            for (var j = 0; j < this.Width; j++)
            {
                str += this.Get(j, i).toString() + ",";
            }
            ret += str + "\n"
            //console.log(str);
        }
        return ret;
    };

    this.FlatFromArr = function(arr, horiz = false)
    {
        var res = undefined;
        if (!horiz) res = new Matrix(1, arr.length);
        else res = new Matrix(arr.length, 1);
        for (var i = 0; i < arr.length; i++)
        {
            if (!horiz) res.Set(0, i, arr[i]);
            else res.Set(i, 0, arr[i]);
        }
        return res;
    };

    this.From2dArr = function(arr2d)
    {
        var mat = new Matrix(arr2d[0].length, arr2d.length);
        for (var i = 0; i < arr2d[0].length; i++)
        {
            for (var j = 0; j < arr2d.length; j++)
            {
                mat.Set(i, j, arr2d[i][j]);
            }
        }
        return mat;
    };

    this.From2dRealArr = function(arr2d)
    {
        var mat = new Matrix(arr2d[0].length, arr2d.length);
        for (var i = 0; i < arr2d[0].length; i++)
        {
            for (var j = 0; j < arr2d.length; j++)
            {
                mat.Set(i, j, arr2d[j][i].Comp());
            }
        }
        return mat;
    };

    this.From2dComplexArr = function(arr2d)
    {
        var mat = new Matrix(arr2d[0].length, arr2d.length);
        for (var i = 0; i < arr2d[0].length; i++)
        {
            for (var j = 0; j < arr2d.length; j++)
            {
                mat.Set(i, j, arr2d[j][i]);
            }
        }
        return mat;
    };

    this.Scalar = function(a)
    {
        var res = new Matrix(this.Width, this.Height);
        for (var i = 0; i < res.Width; i++)
        {
            for (var j = 0; j < res.Height; j++)
            {
                res.Set(i, j, this.Get(i, j).Mult(a));
            }    
        }
        return res;
    };
    
    return this;
}

// var a = new Matrix(3,2);
// a.Vals = [[new Complex(new Decimal(1), new Decimal(0)),new Complex(new Decimal(2), new Decimal(0)),new Complex(new Decimal(3), new Decimal(0))],[new Complex(new Decimal(4), new Decimal(0)),new Complex(new Decimal(5), new Decimal(0)),new Complex(new Decimal(6), new Decimal(0))]];

// var b = new Matrix(2,3);
// b.Vals = [[new Complex(new Decimal(7), new Decimal(0)),new Complex(new Decimal(8), new Decimal(0))],[new Complex(new Decimal(9), new Decimal(0)),new Complex(new Decimal(10), new Decimal(0))],[new Complex(new Decimal(11), new Decimal(0)),new Complex(new Decimal(12), new Decimal(0))]];

// var c = a.Mult(b);
// c.toString();

//N

// var a = new Matrix(3,2);
// a.Vals = [[new Complex(new Decimal(6), new Decimal(0)),new Complex(new Decimal(5), new Decimal(0)),new Complex(new Decimal(4), new Decimal(0))],[new Complex(new Decimal(3), new Decimal(0)),new Complex(new Decimal(2), new Decimal(0)),new Complex(new Decimal(1), new Decimal(0))]];

// var b = new Matrix(2,3);
// b.Vals = [[new Complex(new Decimal(7), new Decimal(0)),new Complex(new Decimal(8), new Decimal(0))],[new Complex(new Decimal(9), new Decimal(0)),new Complex(new Decimal(10), new Decimal(0))],[new Complex(new Decimal(11), new Decimal(0)),new Complex(new Decimal(12), new Decimal(0))]];

// var c = a.Mult(b);
// c.toString();