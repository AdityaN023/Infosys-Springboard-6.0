# -------------------------------------------------------------------------------------
# Basic Python Task
# -------------------------------------------------------------------------------------
try:
    max_Input = int(input('Enter the Job(Input) Count: '));
    if max_Input > 0:
        jobs_List = [];

        print(f'Input job details for {max_Input} jobs'.title().center(100, '-'));

        for i in range(max_Input):
            inp = str(input(f'Enter the Job {i+1} Details: '));

            if inp.rfind(',') != -1:
                inp_split = inp.rsplit(',', 1);
            else:
                inp_split = inp.rsplit(' ', 1);

            inp_split[0] = inp_split[0].strip();
            inp_split[1] = float(inp_split[1].strip());
        
            jobs_List.append(inp_split);

        print("Jobs Having Salary greater than 20k".title().center(100, "-"));

        for job in jobs_List:
            if job[1] > 20000:
                print(f'Job Title: {job[0]} and Salary: ₹{job[1]}');
    else:
        print('Enter input size greater than 0!');
except ValueError:
    print('Salary Invalid OR Salary may contains Invalid Characters...');
except Exception as e:
    print('Error Details: ' + e);
# -------------------------------------------------------------------------------------