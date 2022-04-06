const figlet = require('figlet');

const main = ({ rootDirectory }) => {
  console.log(
    `${figlet(`Remix Demo`)}

  Bootstrapped in: ${rootDirectory}
  `.trim(),
  );
};

module.exports = main;
