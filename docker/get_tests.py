
with open('./user.idr', 'r') as f:
  user_code = f.read()

with open('./evaluate.cases', 'r') as f:
  test_cases = f.read()


# parse test_cases

cases = test_cases.strip().split('\n\n')
#print("cases", cases)

to_test = []
to_check = []
for case in cases:
  f_name, f_cases = case.split(':')
  #print("fun name:", f_name)

  f_cases = list(filter(lambda x: x != '', f_cases.split('\n')))
  #print("fun cases:", f_cases)
  for f_case in f_cases:
    f_case = f_case.strip()
    test, res = f_case.split(' == ')
    to_test.append((f_name, test.strip()))
    to_check.append(f_name + " " + res.strip())

#print("to test", to_test)
#print("to check", to_check)

# MERGE USER CODE WITH TEST CASES
with open('./test2.idr', 'w') as f:
  f.write(user_code)
  f.write("\nmain : IO ()\nmain = do\n")
  for test in to_test:
    # putStr ("tere " ++ show (sumInt 2) ++ "\n")
    f.write("\tputStr (\"" + test[0] + "\" ++ show (" + test[0] + " " + test[1] + ") ++ \"\\n\") \n")
