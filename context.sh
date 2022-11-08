#wget a url and write it to a file  for each url in a list
wget -O - 'https://identity.foundation/credential-manifest/application/v1' > '/Users/alex/Projects/rootid/rootswallet/node_modules/@sphereon/rn-vc-js/lib/contexts/credential-manifest.js'
#Line 15 Add '/Users/alex/Projects/rootid/rootswallet/node_modules/@sphereon/rn-vc-js/lib/contexts/index.js'
#'https://identity.foundation/credential-manifest/application/v1/': require('./credential-manifest'),
