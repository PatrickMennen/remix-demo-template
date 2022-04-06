const figlet = require('figlet');

const main = ({ rootDirectory }) => {
  figlet('Remix Demo', (err, data) => {
    if (err) {
      return;
    }

    console.log(
      `${data}

    Bootstrapped in: ${rootDirectory}
    `.trim(),
    );
  });
};

module.exports = main;
