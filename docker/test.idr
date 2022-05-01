first : (a, b) -> a
first (x, _) = x

sumInt : Int -> Int
sumInt 0 = 0
sumInt n = sumInt (n-1) + n

main : IO ()
main = do
	putStr ("sumInt" ++ show (sumInt 2) ++ "\n")
