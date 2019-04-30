import { 
    Context,
    HttpMethod,
    HttpRequest,
    HttpResponse,
    HttpStatusCode
  } from 'azure-functions-ts-essentials';

  import employeesDb = require('./employees.json');

  /** 
   * Get a specific item
   */

  const getOne = (employeeId: any) => {
      const employee = employeesDb.find((employee)=> {
        return (employee.id == employeeId)
      });
      return {
        status: HttpStatusCode.OK,
        body: employee
      };
  };

  /**
   * Get All items
   */
  const getMany = () => {
    return {
      status: HttpStatusCode.OK,
      body:employeesDb
    };
  };

/**
 * Add Employee
 */
 const insertOne = (employeeToAdd) => {
   //push the employee on the collection 
   const newEmployees = employeesDb;
   newEmployees.push(employeeToAdd);

   //return collection back 
   return {
     status:HttpStatusCode.OK,
     body:newEmployees
   };
 };

 /**
  * Azure Function called by the runtime
  * 
  * @export
  * @param {Context} Context
  * @param {HttpRequest} req
  * @param {Promise<any>}
  */
  export async function run(context:Context, req:HttpRequest):Promise<any>{
    let response: any;
    const employeeId = req.params
        ? req.params.employeeId
        : undefined;

    switch(req.method){
      case 'GET':
          response = employeeId ? getOne(employeeId) : getMany();
          break;
       case 'POST':
          response = insertOne(req.body);
          break;

        default:
          response = {
            status: HttpStatusCode.BadRequest,
            body: {
              error: {
                type: 'not_supported',
                message: `Method ${req.method} not supported.`
              }
            }
          };
    } 

    //ensure
    //-response is of type application/json
    response.headers = {
      'Content-Type' : 'application/json'
    };

    context.res = response;
    Promise.resolve();
  }

