const baseUrl = 'http://localhost:3000/books';


async function fetchWithRandomParams(): Promise<number> {
    const queryParams = generateRandomParams(0);
    const url = `${baseUrl}`;

    try {
        const response = await fetch(url, {
            body: JSON.stringify(queryParams), method: 'POST', headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            return 1; // Successful request
        }
    } catch (error) {
        console.log(error)
        // Handle any errors here
    }
    return 0; // Unsuccessful request
}

function generateRandomParams(numParams: number) {
    const params: Record<string, string> = {};
    for (let i = 0; i < numParams; i++) {
        const key = getRandomString(5);
        const value = getRandomString(10);
        params[key] = value
    }
    return params
}

function getRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

async function runConcurrentRequests(num_of_requests: number) {
    const startTime = Date.now();
    const promises = [];

    for (let i = 0; i < num_of_requests; i++) {
        promises.push(fetchWithRandomParams());
    }


    const results = await Promise.all(promises);

    const successfulRequests = results.reduce((sum, result) => sum + result, 0);

    const endTime = Date.now();
    const elapsedTimeInSeconds = (endTime - startTime) / 1000;

    console.log(`Successful requests: ${successfulRequests}`);
    console.log(`Time taken (seconds): ${elapsedTimeInSeconds}`);
    console.log(`Requests per second: ${successfulRequests / elapsedTimeInSeconds}`);
    await fetch(`${baseUrl}?num_of_requests=true`)
}


// get command line arguments
const args = process.argv.slice(2);
// get number of requests from command line
const num_of_requests = args[0] ? parseInt(args[0]) : 100;

runConcurrentRequests(num_of_requests);





