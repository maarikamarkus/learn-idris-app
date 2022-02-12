sumInt : Int -> Int 
sumInt 0 = 0 
sumInt n = sumInt (n-1) + n

sumInt2 : Int -> Int 
sumInt2 0 = 0 
sumInt2 n = sumInt2 (n-1) + n

main : IO ()
main = do
	putStr ("sumInt" ++ show (sumInt 2) ++ "\n") 
	putStr ("sumInt" ++ show (sumInt 3) ++ "\n") 
	putStr ("sumInt2" ++ show (sumInt2 1) ++ "\n") 
	putStr ("sumInt2" ++ show (sumInt2 2) ++ "\n") 
