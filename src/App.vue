<template>
  <Form v-if="dedicatucancionJson.mode === 'form'" />
  <Order :dedicatucancionJson="dedicatucancionJson" v-else />
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Vue } from "vue-property-decorator";
import Form from "@/components/Form.vue";
import Order from "@/components/Order.vue";
import wordpressSetup from "@/services/wordpress-setup.service";
import slackService from "@/services/slack.service";

@Component({
  components: { Form, Order },
})
export default class App extends Vue {
  private dedicatucancionJson: any = { mode: "form" };

  created(): void {
    if ((this.$parent as any).dedicatucancionJson) {
      this.dedicatucancionJson = JSON.parse(
        (this.$parent as any).dedicatucancionJson
      );
    }
  }
  mounted(): void {
    wordpressSetup();
    slackService.listenners();
  }
}
</script>

<style lang="postcss"></style>
