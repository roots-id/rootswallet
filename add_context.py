import requests,os,sys

def run(url,context_name):
    """Add a context to a the document loader for the rn-vc-js library"""
    #get context text
    ctx = requests.get('https://purl.imsglobal.org/spec/ob/v3p0/context.json').content
    #make it node friendly
    ctx_new = 'module.exports=' + ctx.decode('utf-8') 
    #write the context to the file
    cwd = os.getcwd()
    with open(f'{cwd}/node_modules/@sphereon/rn-vc-js/lib/contexts/'+context_name+'.js', 'w') as f:
        f.write(ctx_new)
    #read /Users/alex/Projects/rootid/rootswallet/node_modules/@sphereon/rn-vc-js/lib/contexts/index.js into an array
    with open(f'{cwd}/node_modules/@sphereon/rn-vc-js/lib/contexts/index.js') as f:
        lines = f.readlines()
    #find all the index of the lines that start with 'https'
    indexes = [i for i, s in enumerate(lines) if 'https' in s]
    #find the line with the last context mapping
    latest = indexes.pop()
    #add context mapping line so the file is downloaded is rechable to the documentLoader
    lines.insert(latest+1,f'  \'{url}\': require(\'./{context_name}\'),\n')
    #write the new lines to the file
    with open(f'{cwd}/node_modules/@sphereon/rn-vc-js/lib/contexts/index.js', 'w') as f:
        f.writelines(lines)
if __name__ == '__main__':
    """
    This script is a temporary fix for the rn-vc-js library. 
    It adds a context to the document loader in the node modules folder.
    So if you need new contexts mappings you can add them with this script.
    """
    url = sys.argv[1]
    context_name = sys.argv[2]
    run(url,context_name)
    #EXAMPLE 
    #python3 add_context.py 'https://purl.imsglobal.org/spec/ob/v3p0/context.json' 'jff2context'