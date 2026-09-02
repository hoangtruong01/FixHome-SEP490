<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <div class="text-center mb-8">
      <img src="../../assets/logo.png" alt="FixHome Logo" class="w-20 h-20 mx-auto mb-3 object-contain" />
      <h1 class="text-2xl font-bold text-gray-900">FixHome</h1>
      <p class="text-gray-500 mt-1">Home Repair & Maintenance Platform</p>
    </div>

    <form class="space-y-4" @submit.prevent="handleLogin">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="Enter your email"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter your password"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <button
        type="submit"
        class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Login
      </button>
    </form>

    <p class="text-center text-sm text-gray-400 mt-6">
      <!-- TODO: Implement login functionality -->
      Placeholder – Login feature will be implemented later
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const email = ref('');
const password = ref('');

function handleLogin() {
  // TODO: Implement login API call
  console.log('Login attempt:', email.value);
}
</script>
