#APIKEY='da2-tadwcysgfbgzrjsfmuf7t4huui'

curl 'https://pb3c6uzk5zhrzbcuhssogcpq74.appsync-api.us-east-1.amazonaws.com/graphql' -H 'x-api-key: da2-tadwcysgfbgzrjsfmuf7t4huui' -H 'Content-Type: application/json' --data-binary '{"query":"{\n  launchCommentsByFlightNumber(flightNumber: 12) {\n    items {\n      id\n      author\n      body\n      date\n    }\n  }\n}"}'