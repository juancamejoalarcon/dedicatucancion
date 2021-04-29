import Vue from "vue";
import VueRx from "vue-rx";
import App from "@/App.vue";
import store from "@/store/store";
import VModal from "vue-js-modal";
import "./main.css";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// FIXME: add types
import VuejsClipper from "vuejs-clipper/dist/vuejs-clipper.umd";
import "vuejs-clipper/dist/vuejs-clipper.css";

Vue.config.productionTip = false;
Vue.use(VuejsClipper);
Vue.use(VueRx);
Vue.use(VModal);

const el = document.getElementById("dedicatucancion");

if (el) {
  new Vue({
    el,
    store,
    data: {
      dedicatucancionJson: el.getAttribute("dedicatucancion-json"),
    },
    render: (h) => h(App),
  });
}
