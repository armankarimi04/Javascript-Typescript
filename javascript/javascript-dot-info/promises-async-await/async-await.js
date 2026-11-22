// A nice syntax to use with promises is called async/await

// async functions
async function f() {
    // return Promise.resolve(1); // it's as same as:
    return 1;
}

// async functions will always return a promise
f().then(console.log); // 1

// the keyword await makes javascript wait until a promise is settled and returns its result
async function f() {
    let promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve("done!"), 1000);
    });

    let result = await promise; // wait until the promise resolves, JS can do other things while waiting for this
    console.log(result); // "done!"
}


// The previous showAvatar() function from before in async style
async function showAvatar() {
    // read our JSON
    let response = await fetch('/article/promise-chaining/user.json');
    let user = await response.json();

    // read github user
    let githubResponse = await fetch(`https://api.github.com/users/${user.name}`);
    let githubUser = await githubResponse.json();

    // show the avatar
    let img = document.createElement('img');
    img.src = githubUser.avatar_url;
    img.className = "promise-avatar-example";
    document.body.append(img);

    // wait 3 seconds
    await new Promise((resolve, reject) => setTimeout(resolve, 3000));
    img.remove();
    return githubUser;
}


// Modern browsers allow for top-level await
let response = await fetch("/some-stuff");
let usre = await response.json();


// for older recipes, we could wrap the await into an anonymous async function
(async () => {
    let response = await fetch('/article/promise-chaining/user.json');
    let user = await response.json();
    // ...
})();


// methods can also be async
class Waiter {
    async wait() {
        return await Promise.resolve(1);
    }
}

new Waiter()
    .wait()
    .then(console.log);


// Error handling
async function f() {
    try {
        let response = await fetch("/somewhere");
    } catch (err) {
        console.log(err); // TypeError: failed to fetch
    }
}

f();

// Tasks
// Rewrite this function in async style
function loadJson(url) {
    return fetch(url)
        .then(response => {
            if (response.status == 200) {
                return response.json();
            } else {
                throw new Error(response.status);
            }
        });
}

loadJson('https://javascript.info/no-such-user.json')
    .catch(alert); // Error: 404

// my answer 1: relatively ok
async function loadJson(url) {
    let response = await fetch(url);
    let result;
    if (response.status == 200) {
        result = await response.json();
        return result;
    } else {
        throw new Error(response.status);
    }
}

loadJson("/somewhere").catch(console.log); // Error: 404

// proper answer
async function loadJson(url) {
    let response = await fetch(url);
    if (response.status == 200) {
        let json = await response.json();
        return json;
    }
    throw new Error(response.status);
}


// -------------------------------------
class HttpError extends Error {
    constructor(response) {
        super(`${response.status} for ${response.url}`);
        this.name = 'HttpError';
        this.response = response;
    }
}

function loadJson(url) {
    return fetch(url)
        .then(response => {
            if (response.status == 200) {
                return response.json();
            } else {
                throw new HttpError(response);
            }
        });
}

// Ask for a user name until github returns a valid user (ReWrite ThiS in Async and Replace the Recursiion with Loop)
function demoGithubUser() {
    let name = prompt("Enter a name?", "iliakan");

    return loadJson(`https://api.github.com/users/${name}`)
        .then(user => {
            alert(`Full name: ${user.name}.`);
            return user;
        })
        .catch(err => {
            if (err instanceof HttpError && err.response.status == 404) {
                alert("No such user, please reenter.");
                return demoGithubUser();
            } else {
                throw err;
            }
        });
}

demoGithubUser();


// my attempt
async function demoGithubUser() {
    let name = prompt("Enter a github username: ", "someguy");
    let result = await loadJson(`http://api.github.com/users/${name}`);
    while (true) {
        if (result) {
            break;
        }
        result = await loadJson(`http://api.github.com/users/${name}`);
    }
    return result;
}


// correct answer
async function demoGithubUser() {
    let user;
    while (true) {
        let name = prompt("Enter username:", "dumbdumb");
        try {
            user = await loadJson(`http://api.github.com/users/${name}`);
            break; // no error, exit loop
        } catch (err) {
            if (err instanceof HttpError && err.response.status == 404) {
                console.log("No such user. try again...");
            } else {
                throw err; // unknown error, rethrow
            }
        }
    }

    console.log(`Full name: ${user.name}`);
    return user;
}



// IMPORTANT
// How to use an async function inside a regular function
// answer: Treat it as a regular Promise
async function wait() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 10;
}

function f() {
    // ...what should you write here?
    // we need to call async wait() and wait to get 10
    // remember, we can't use "await"
    wait().then(result => console.log(result));
}

f(); // use it as a regular function