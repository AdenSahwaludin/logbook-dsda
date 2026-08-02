<template>
  <div class="space-y-3">
    <label class="block text-sm font-semibold text-slate-700">
      Foto Dokumentasi Kegiatan <span class="text-red-500">*</span>
    </label>

    <!-- Image Preview Mode -->
    <div v-if="modelValue" class="relative card-base p-2 group overflow-hidden">
      <img :src="modelValue" alt="Preview Foto Laporan" class="w-full h-56 object-cover rounded-xl" />
      <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
        <button
          type="button"
          @click="openLightbox = true"
          class="p-2.5 bg-white/90 rounded-xl text-slate-800 hover:bg-white transition"
          title="Perbesar Foto"
        >
          <Maximize2 class="w-5 h-5" />
        </button>
        <button
          type="button"
          @click="removePhoto"
          class="p-2.5 bg-red-600/90 rounded-xl text-white hover:bg-red-600 transition"
          title="Hapus Foto"
        >
          <Trash2 class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Upload Input Options -->
    <div v-else class="space-y-3">
      <div 
        class="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer"
        @click="triggerFileInput('gallery')"
      >
        <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <Camera class="w-6 h-6" />
        </div>
        <p class="text-sm font-semibold text-slate-800">Ambil Foto atau Pilih dari Galeri</p>
        <p class="text-xs text-slate-500 mt-1">Format JPG, PNG (Kompresi otomatis max 1MB)</p>

        <div class="flex items-center justify-center gap-3 mt-4">
          <button 
            type="button" 
            class="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            @click.stop="triggerFileInput('camera')"
          >
            <Camera class="w-4 h-4 text-blue-600" />
            Kamera
          </button>
          <button 
            type="button" 
            class="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            @click.stop="triggerFileInput('gallery')"
          >
            <ImageIcon class="w-4 h-4 text-emerald-600" />
            Galeri Foto
          </button>
        </div>
      </div>

      <!-- Hidden Inputs -->
      <input 
        ref="galleryInputRef" 
        type="file" 
        accept="image/*" 
        class="hidden" 
        @change="handleFileSelected" 
      />
      <input 
        ref="cameraInputRef" 
        type="file" 
        accept="image/*" 
        capture="environment" 
        class="hidden" 
        @change="handleFileSelected" 
      />
    </div>

    <!-- Progress Bar during processing -->
    <div v-if="isUploading" class="space-y-1.5 p-3 bg-blue-50 rounded-xl border border-blue-100">
      <div class="flex justify-between text-xs font-semibold text-blue-800">
        <span>{{ uploadStatusText }}</span>
        <span>{{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-150"
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <div 
        v-if="openLightbox && modelValue" 
        class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        @click="openLightbox = false"
      >
        <button class="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-xl">
          <X class="w-7 h-7" />
        </button>
        <img :src="modelValue" class="max-w-full max-h-[90vh] object-contain rounded-lg" @click.stop />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Camera, Image as ImageIcon, Trash2, Maximize2, X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits(['update:modelValue', 'error'])

const galleryInputRef = ref<HTMLInputElement | null>(null)
const cameraInputRef = ref<HTMLInputElement | null>(null)

const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadStatusText = ref('Mengompres foto...')
const openLightbox = ref(false)

function triggerFileInput(type: 'camera' | 'gallery') {
  if (type === 'camera' && cameraInputRef.value) {
    cameraInputRef.value.click()
  } else if (galleryInputRef.value) {
    galleryInputRef.value.click()
  }
}

function removePhoto() {
  emit('update:modelValue', '')
}

function handleFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Validate type
  if (!file.type.startsWith('image/')) {
    emit('error', 'File harus berupa gambar JPG/PNG!')
    return
  }

  isUploading.value = true
  uploadProgress.value = 10
  uploadStatusText.value = 'Membaca file foto...'

  const reader = new FileReader()
  reader.onload = (e) => {
    uploadProgress.value = 40
    uploadStatusText.value = 'Mengompresi & meresize foto...'

    const img = new Image()
    img.onload = () => {
      // Resize to max 1200px width/height and compress to 0.75 quality JPEG
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height
      const MAX_SIZE = 1200

      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width)
          width = MAX_SIZE
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height)
          height = MAX_SIZE
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
      }

      uploadProgress.value = 80
      uploadStatusText.value = 'Memproses foto...'

      setTimeout(() => {
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75)
        uploadProgress.value = 100
        uploadStatusText.value = 'Foto berhasil diunggah!'
        
        setTimeout(() => {
          isUploading.value = false
          emit('update:modelValue', compressedBase64)
          target.value = '' // reset input
        }, 300)
      }, 400)
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}
</script>
