import Vue from "vue";
import App from "./App.vue";
import AceJsonEditor from "./components/AceJsonEditor.vue";

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
