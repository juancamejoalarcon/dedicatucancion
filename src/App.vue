<template>
  <Form v-if="dedicatucancionJson.mode === 'form'" />
  <Order :dedicatucancionJson="dedicatucancionJson" v-else />
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Vue } from "vue-property-decorator";
import Form from "@/components/Form.vue";
import Order from "@/components/Order.vue";
// import Dedicatucancion from "@/models/Dedicatucancion";
import wordpressSetup from "@/services/wordpress-setup.service";

@Component({
  components: { Form, Order },
})
export default class App extends Vue {
  private dedicatucancionJson: any = { mode: "form" };

  created(): void {
    console.log("------");
    console.log("---PROBANDO DEPLOY---");
    console.log("------");
    if ((this.$parent as any).dedicatucancionJson) {
      this.dedicatucancionJson = JSON.parse(
        (this.$parent as any).dedicatucancionJson
      );
    }
  }
  mounted(): void {
    wordpressSetup();
  }
}
</script>

<style lang="postcss"></style>
