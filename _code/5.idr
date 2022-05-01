prindiArvud : List Int -> IO ()
prindiArvud [] = pure ()
prindiArvud (x :: xs) = do
    putStrLn (show x)
    prindiArvud xs