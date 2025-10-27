<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import * as api from '~/apis'

useHead({
  title: 'Profile',
})

const bgRef = ref()
const { userInfo, getUserInfo } = useUserStore()
const useSaveInfo = () => {
  const loading = ref(false)
  const formRef = ref()
  const infoForm = ref({
    username: '',
    sex: '',
    sexSelect: '',
    nickname: '',
    ...userInfo,
    id: undefined,
  })

  const rules = ref({
    username: [{ required: true, message: 'Please input', trigger: 'blur' }],
    sex: [{ required: true, message: 'Please input', trigger: 'blur' }],
    sexSelect: [{ required: true, message: 'Please input', trigger: 'blur' }],
    nickname: [{ required: true, message: 'Please input', trigger: 'blur' }],
  })

  const handleSave = async (formEl: FormInstance | undefined) => {
    await verifyForm(formEl)
    await doSave()
  }

  const doSave = async () => {
    try {
      loading.value = true
      await api.saveUserInfo({
        email: userInfo.email,
        ...infoForm.value,
      })
      await getUserInfo()
      window.location.href = '/ai/chat/new?new=true'
    }
    catch (error) {

    }
    finally {
      loading.value = false
    }
  }

  return {
    formRef,
    infoForm,
    rules,
    loading,
    handleSave,
  }
}

const { formRef, infoForm, rules, loading, handleSave } = useSaveInfo()

const handleBack = () => {
  window.location.href = '/'
}
</script>

<template>
  <NuxtLayout name="info">
    <template #content>
      <div
        class="relative h-full w-full"
        flex="~ items-center justify-center"
        @mousemove="bgRef.handleMouseMove"
        @mouseleave="bgRef.handleMouseLeave"
      >
        <div
          class="card absolute w-[860px] rounded-[32px] bg-[#17171A] p-[40px]"
          border="4px solid #6633EE"
          text="#FFFFFF"
        >
          <div text="32px" font="bold" class="mb-[16px]">
            Profile
          </div>
          <el-form ref="formRef" :rules="rules" :model="infoForm">
            <el-row :gutter="48">
              <el-col :span="12">
                <el-form-item prop="username">
                  <div>
                    <div text="14px">What should I call you?</div>
                    <div
                      class="w-[366px] rounded-[12px] px-[16px] py-[8px]"
                      flex="~ items-center"
                      :style="{ background: 'rgba(255,255,255,0.05)' }"
                    >
                      <input
                        v-model="infoForm.username"
                        text="#fff 14px"
                        class="h-[24px] flex-1"
                        placeholder="Please enter your preferred name"
                      />
                    </div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="nickname">
                  <div>
                    <div text="14px">What nickname do you have?</div>
                    <div
                      class="w-[366px] rounded-[12px] px-[16px] py-[8px]"
                      flex="~ items-center"
                      :style="{ background: 'rgba(255,255,255,0.05)' }"
                    >
                      <input
                        v-model="infoForm.nickname"
                        text="#fff 14px"
                        class="h-[24px] flex-1"
                        placeholder="Please enter your nickname"
                      />
                    </div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="sex">
                  <div>
                    <div text="14px">Can you tell me your gender?</div>
                    <div
                      class="w-[366px] rounded-[12px] px-[16px] py-[8px]"
                      flex="~ items-center"
                      :style="{ background: 'rgba(255,255,255,0.05)' }"
                    >
                      <input
                        v-model="infoForm.sex"
                        text="#fff 14px"
                        class="h-[24px] flex-1"
                        placeholder="Please fill in your gender"
                      />
                    </div>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="sexSelect">
                  <div>
                    <div text="14px">
                      Can you tell me about your sexual orientation
                    </div>
                    <div
                      class="w-[366px] rounded-[12px] px-[16px] py-[8px]"
                      flex="~ items-center"
                      :style="{ background: 'rgba(255,255,255,0.05)' }"
                    >
                      <input
                        v-model="infoForm.sexSelect"
                        text="#fff 14px"
                        class="h-[24px] flex-1"
                        placeholder="Please indicate your sexual orientation"
                      />
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div flex="~ justify-center items-center" class="mt-[20px]">
            <el-button class="back-btn" @click="handleBack">
              Back
            </el-button>
            <el-button class="save-btn" :loading="loading" @click="handleSave(formRef)">
              Save Profile
            </el-button>
          </div>
        </div>
      </div>
    </template>
    <template #bg>
      <UiDynamicsBg ref="bgRef" />
    </template>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.save-btn {
  width: 280px;
  height: 60px;
  background:
    linear-gradient(90deg, #703edb 0%, #ea8cff 60%, #0c76ff 100%), #37303f;
  border-radius: 20px;
  font-family: Gilroy, Gilroy;
  font-weight: bold;
  font-size: 16px;
  color: #ffffff;
  border: unset;
}
.back-btn {
  width: 280px;
  height: 60px;
  background: #37303f;
  border-radius: 20px;
  font-family: Gilroy, Gilroy;
  font-weight: bold;
  font-size: 16px;
  color: #ffffff;
  border: unset;
  margin-right: 20px;
}
</style>
