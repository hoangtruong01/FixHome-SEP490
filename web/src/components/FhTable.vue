<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface Props {
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  loading?: boolean;
  emptyText?: string;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  emptyText: 'Không có dữ liệu',
});
</script>

<template>
  <div class="w-full overflow-x-auto rounded-[var(--radius-md)] border border-ink-200 bg-white shadow-[var(--shadow-e1)]">
    <table class="w-full border-collapse text-left text-sm">
      <!-- Sticky Overline Header -->
      <thead class="sticky top-0 bg-ink-50 border-b border-ink-200 z-10">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-5 py-3 text-overline text-ink-600 uppercase tracking-wider font-semibold select-none"
            :class="[
              col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
            ]"
            :style="{ width: col.width }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>

      <!-- Body: 56px rows, hover ink-25, no zebra -->
      <tbody class="divide-y divide-ink-100">
        <tr v-if="loading">
          <td :colspan="columns.length" class="h-40 text-center text-ink-500">
            <div class="inline-flex items-center gap-2">
              <Loader2 class="animate-spin text-brand-600" :size="20" />
              <span>Đang tải dữ liệu...</span>
            </div>
          </td>
        </tr>

        <tr v-else-if="rows.length === 0">
          <td :colspan="columns.length" class="h-32 text-center text-ink-500">
            {{ emptyText }}
          </td>
        </tr>

        <tr
          v-for="(row, rIdx) in rows"
          v-else
          :key="rIdx"
          class="h-[56px] transition-colors duration-100 hover:bg-ink-25"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-5 py-3 text-ink-900"
            :class="[
              col.align === 'right' ? 'text-right font-num' : col.align === 'center' ? 'text-center' : 'text-left',
            ]"
          >
            <slot :name="`cell(${col.key})`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
