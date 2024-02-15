export default (str: string, keys: any[] | Record<string, any>) => Object.entries(keys || [])
  .reduce((acc, [key, value]) => acc.replace(new RegExp(`{${key}}`, 'gi'), value), str);
