let http = require('http');
let fs = require('fs');

let port = 5000;

let myFile = JSON.parse(fs.readFileSync('employees.json').toString());

let requestHandler = (request, response) => {
  switch (request.method) {
    // http://127.0.0.1:5000/employees for simple search of all employees
    case "GET":
        if (request.url === '/employees') {
          response.writeHead(200, {'Content-Type': 'aplication/json'});
          response.end(JSON.stringify(myFile));
        } else if (request.url.split('/')[1] === 'employees') {
    // for example: http://127.0.0.1:5000/employees/Financial will return all employees wich work on that department
          let department = request.url.split('/')[2];
          let getJSON = [];
          let departExists = 0;
          for(let i = 0; i < myFile.length; i++) {
            if (myFile[i].department == department) {
              departExists = 1;
              getJSON.push(myFile[i]);
            }
          }
          if (departExists) {
            response.writeHead(200, {'Content-Type': 'aplication/json'});
            response.end(JSON.stringify(getJSON));
          } else {
            response.statusCode = 404;
            response.end();
            console.log("Didn't found this department in data.")
          }
        } else {
          response.statusCode = 501;
          response.end();
        }
    // http://127.0.0.1:5000/addemployee
    // POST object with id, firstName, lastName and department
      case "POST":
        if (request.url === '/addemployee') {
          var body = '';
            request.on('data', function (data) {
                body += data;
                if (body.length > 1e6) {
                    request.connection.destroy();
                    response.writeHead(400, {'Content-Type': 'aplication/json'});
                    request.connection.destroy();
                    console.log("Request Too Large on Post Method.");
                  }
            });
            request.on('end', function () {
                let post = JSON.parse(body);
                let employee = {
                  id: post['id'],
                  firstName: post['firstName'],
                  lastName: post['lastName'],
                  department: post['department']
                }
                let ok = 1;
                for(let i = 0; i < myFile.length; i++) {
                  // verify if the id already exists
                  if (myFile[i].id == employee.id) {
                    ok = 0;
                  }
                }
                if (ok) {
                  myFile.push(employee);
                  response.writeHead(200, {'Content-Type': 'aplication/json'});
                  console.log("Employee added succesfully");
                } else {
                  response.statusCode = 404;
                  console.log("Id already exists");
                  request.connection.destroy();
                }
            });
        } else {
          response.statusCode = 501;
          response.end();
        }
        // http://127.0.0.1:5000/update
        // PUT object with id, firstName, lastName and department
        case "PUT":
          if (request.url === '/update') {
            let body = '';
              request.on('data', function (data) {
                  body += data;
                  if (body.length > 1e6)
                      request.connection.destroy();
              });
              request.on('end', function () {
                let post = JSON.parse(body);
                  var employee = {
                    id: post['id'],
                    firstName: post['firstName'],
                    lastName: post['lastName'],
                    department: post['department']
                  }
                  let exists = 0;
                  for(let i = 0; i < myFile.length; i++) {
                    // search for object with the id equal with the one requested and replace it with employee object
                    if (myFile[i].id == employee.id && exists==0) {
                      exists = 1;
                      myFile[i] = employee;
                    }
                  }
                  if (exists) {
                    response.writeHead(200, {'Content-Type': 'aplication/json'});
                    response.end(JSON.stringify(myFile));
                  } else {
                    response.statusCode = 404;
                    console.log("There is no employee with id requested.");
                    request.connection.destroy();
                  }
              });
          } else {
            response.statusCode = 501;
            response.end();
          }
          // http://127.0.0.1:5000/delete/2
          // DELETE object with the id given in url
          case "DELETE":
            if (request.url.split('/')[1] === 'delete') {
              let id = request.url.split('/')[2];
              let exists = 0;
              for(let i = 0; i < myFile.length; i++) {
                if (myFile[i].id == id) {
                  exists = 1;
                  myFile[i] = "";
                }
              }
              if (exists) {
                response.writeHead(200, {'Content-Type': 'aplication/json'});
                response.end(JSON.stringify(myFile));
              } else {
                response.statusCode = 404;
                response.end();
                console.log("There is no employee with id requested.");
              }
            } else {
              response.statusCode = 501;
              response.end();
            }
            // for example http://127.0.0.1:5000/update/2
            case "PATCH":
              if (request.url.split('/')[1] === 'update') {
                let id = request.url.split('/')[2];
                let body = '';
                  request.on('data', function (data) {
                      body += data;
                      if (body.length > 1e6)
                          request.connection.destroy();
                  });
                  request.on('end', function () {
                    var post = JSON.parse(body);
                      var employee = {
                        id: post['id'],
                        firstName: post['firstName'],
                        lastName: post['lastName'],
                        department: post['department']
                      }
                let exists = 0;
                for(let i = 0; i < myFile.length; i++) {
                  if (myFile[i].id == id) {
                    exists = 1;
                    if (employee.firstName) {
                      myFile[i].firstName = employee.firstName;
                    }
                    if (employee.lastName) {
                      myFile[i].lastName = employee.lastName;
                    }
                    if (employee.department) {
                      myFile[i].department = employee.department;
                    }
                  }
                }
                if (exists) {
                  response.writeHead(200, {'Content-Type': 'aplication/json'});
                  response.end(JSON.stringify(myFile));
                } else {
                  response.statusCode = 404;
                  response.end();
                  console.log("There is no employee with id requested.");
                }
              });
            } else {
              response.statusCode = 501;
              response.end();
              }
              break;
            break;
          break;
        break;
      break;
    default:
      request.end("Error");
  }
}

let server = http.createServer(requestHandler);

server.listen(port, (err) => {
    if (err) {
        return console.log("Server can't listen on  port 5000.", err);
    }
    console.log(`server is listening on port ${port}`);
});
