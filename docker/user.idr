sumInt : Int -> Int 
sumInt 0 = 0 
sumInt n = sumInt (n-1) + n

sumInt2 : Int -> Int 
sumInt2 0 = 0 
sumInt2 n = sumInt2 (n-1) + n
