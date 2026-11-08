import re
def mk(src,dst,thanks=None):
    s=open(src).read()
    s=re.sub(r'img/(lt-[a-z]+\.webp)',lambda m:"{% endraw %}{{ '"+m.group(1)+"' | file_url }}{% raw %}",s)
    if thanks and 'variantId' in s: s=s.replace("variantId:''","variantId:'68126580441275'")
    if thanks: s=s.replace("thanksUrl:'gracias.html'","thanksUrl:'%s'"%thanks)
    open(dst,'w').write('{% layout none %}{% raw %}'+s+'{% endraw %}')
mk('index.html','shopify-us/templates/page.latido.liquid','/pages/latido-gracias')
mk('index.html','shopify-us/templates/product.latido.liquid','/pages/latido-gracias')
mk('gracias.html','shopify-us/templates/page.latido-gracias.liquid')
