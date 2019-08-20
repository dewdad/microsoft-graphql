import { extendType, stringArg } from "nexus";
import * as request from 'request';

const users = extendType( {
  type: "Query",
  definition(t) {
    t.list.field('users', {
      type: 'User',
      args: {
        givenNameStartsWith: stringArg({required: false})
      },
      resolve: async (parent, args, ctx, info) => {
        
        
        let url = "https://graph.microsoft.com/v1.0/users";
        const queryOptions = [];
        
        if (args.givenNameStartsWith) {
          queryOptions.push("$filter=startswith(givenName,'" + args.givenNameStartsWith + "')");
        } 

        if (queryOptions.length > 0) {
          for (let i = 0; i < queryOptions.length; i++) {
            if (i === 0) {
              url = url + "?" + queryOptions[i];
            } else {
              url = url + "&" + queryOptions[i];
            }
          }
        }

        const users : any = await new Promise( ( resolve, reject ) => {
          request.get({
            url: url,
            headers: {
              "Authorization": "Bearer " + ctx.access_token
            }
          }, function(err, response, body) {
            resolve(JSON.parse(body));
          });
        });
        
        const result = [];
        users.value.map((user) => {
          result.push({
            id: user.id,
            displayName: user.displayName,
            givenName: user.givenName,
            surname: user.surname,
            userPrincipalName: user.userPrincipalName,
            jobTitle: user.jobTitle,
            mail: user.mail,
          });
        });

        return result;
      },
    })
  }
});

export default users;
