import HOME from '../pages/home.jsx';
import CHICKENS from '../pages/chickens.jsx';
import FEEDING from '../pages/feeding.jsx';
import GROWTH from '../pages/growth.jsx';
import INVENTORY from '../pages/inventory.jsx';
import LOCATION_LOGIN from '../pages/location-login.jsx';
export const routers = [{
  id: "home",
  component: HOME
}, {
  id: "chickens",
  component: CHICKENS
}, {
  id: "feeding",
  component: FEEDING
}, {
  id: "growth",
  component: GROWTH
}, {
  id: "inventory",
  component: INVENTORY
}, {
  id: "location-login",
  component: LOCATION_LOGIN
}]