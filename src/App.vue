<script setup lang="ts">
import { seedBundle } from './data/seed'
</script>

<template>
  <main>
    <p class="eyebrow">Dataset Ready</p>
    <h1>Financial Agent Evaluation Arena</h1>
    <dl>
      <div>
        <dt>Cases</dt>
        <dd>{{ seedBundle.cases.length }}</dd>
      </div>
      <div>
        <dt>Models</dt>
        <dd>{{ seedBundle.models.length }}</dd>
      </div>
      <div>
        <dt>Responses</dt>
        <dd>{{ seedBundle.responses.length }}</dd>
      </div>
    </dl>
  </main>
</template>

