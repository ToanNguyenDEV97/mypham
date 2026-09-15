const fs = require('fs');
let code = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');

code = code.replace(
  `      } catch (error) {
        console.error('Error fetching home data', error);
        setHomeProducts(products.slice(0, 4));
      }`,
  `      } catch (error) {
        console.error('Error fetching home data:', error);
      }`
);

fs.writeFileSync('src/components/views/HomeView.tsx', code);
