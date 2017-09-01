/**
  These are the visual reminder of product data stored in Product collection
**/

new Product({
  third: 'Digital Cameras',
  product: [
    {
    model: 'Samsung NX3000',
    specification: 'Samsung NX3000 specs here'
    },
    {
      model: 'Nikon D800',
      specification: 'Nikon D800 specs here'
    }
  ]
}).save();

new Product({
  third: 'Telephony',
  product: [
    {
      model: 'Samsung S3',
      specification: 'Samsung S3 specs here'
    }
  ]
}).save();

new Product({
  third: 'Printers, Copiers & Fax Machines',
  product: [
    {
      model: 'HP Officejet Pro X576dw Multifunction',
      specification: 'HP Officejet Pro X576dw Multifunction specs here'
    },
    {
      model: 'Dell B1163w Mono Laser Multifunction',
      specification: 'Dell B1163w Mono Laser Multifunction specs here'
    }

  ]
}).save();
