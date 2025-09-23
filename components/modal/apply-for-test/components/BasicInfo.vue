<script setup lang="ts">
import type { FormRules } from 'element-plus'

const phoneCode = [{ value: 86, label: '+86' }]
const formRef = ref()
const ruleForm = ref({ phone: '', applyReason: '', phoneCode: 86 })
const rules = reactive<FormRules>({
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' },
  ],
})
defineExpose({
  formRef,
  ruleForm,
})
</script>

<template>
  <div class="mb-[32px] text-[20px] text-[#141414] font-bold">
    <div>
      AI心理咨询功能内测中，请填写手机号并填写申请理由，我们会为你开通内测权益
    </div>
  </div>
  <el-scrollbar class="flex-1">
    <el-form
      ref="formRef"
      style="width: 98%"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      label-position="top"
    >
      <div>
        <el-form-item
          class="login-modal__content-form-input phone"
          prop="phone"
          label="手机号（试用登录）"
        >
          <el-input
            v-model.trim="ruleForm.phone"
            class="h-[46px]"
            placeholder="请输入手机号"
          >
            <template #prepend>
              <el-select
                v-model="ruleForm.phoneCode"
                class="login-modal__content-form-input-select"
                placeholder="区号"
              >
                <el-option
                  v-for="item in phoneCode"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="login-modal__content-form-input" label="申请理由">
          <el-input
            v-model.trim="ruleForm.applyReason"
            type="textarea"
            placeholder="请输入申请理由"
            :rows="3"
          >
          </el-input>
        </el-form-item>
      </div>
    </el-form>
  </el-scrollbar>
</template>

<style lang="scss" scoped>
.login-modal {
  &__content {
    &-form {
      &-input {
        &-select {
          width: 103px;

          :deep(.el-select__wrapper) {
            box-shadow: 0 0 0 1px $color-fill-5 inset !important;
          }
        }

        &-append {
          width: 120px !important;
          font-size: 16px;
          line-height: 19px;
          color: $brand-1 !important;
        }

        :deep(.el-input) {
          --el-input-border-color: $color-fill-5;
        }

        :deep(.el-input-group__prepend),
        :deep(.el-input-group__append) {
          border: 0;
        }

        :deep(.el-input__wrapper) {
          background: $color-fill-5;

          & input::-webkit-input-placeholder {
            font-weight: 500;
            font-size: 16px;
            color: #b8b8b8;
            line-height: 19px;
          }
        }

        :deep(.el-textarea__inner) {
          background: $color-fill-5;
          --el-input-border-color: $color-fill-5;
        }

        &.phone {
          margin-bottom: 30px;
        }
      }
    }
  }
}
</style>
