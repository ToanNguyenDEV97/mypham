const fs = require('fs');
let code = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');

const oldLogic = `        const fetchedProducts = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const combinedMap = new Map();
        products.forEach(p => combinedMap.set(String(p.id), p));
        fetchedProducts.forEach(p => combinedMap.set(String(p.id), p));
        setHomeProducts(Array.from(combinedMap.values()).slice(0, 4));`;

const newLogic = `        const fetchedProducts = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        setHomeProducts(fetchedProducts.slice(0, 8)); // maybe 8 is better, or just 4`;

code = code.replace(oldLogic, newLogic);

const oldCatch = `      } catch (error) {
        console.error('Error fetching home data:', error);
        setHomeProducts(products.slice(0, 4));
      }`;

const newCatch = `      } catch (error) {
        console.error('Error fetching home data:', error);
        // Do not fallback to mock
      }`;

code = code.replace(oldCatch, newCatch);

fs.writeFileSync('src/components/views/HomeView.tsx', code);
