<script setup lang="ts"></script>

<template>
  <div class="coach-select">
    <el-popover
      placement="top-start"
      effect="dark"
      trigger="click"
      :show-arrow="false"
      :popper-style="{
        padding: '0px',
        background: 'transparent',
        border: 'none',
        width: '868px',
      }"
    >
      <template #reference>
        <div
          class="cursor-pointer rounded-[20px]"
          style="background: linear-gradient( 90deg, #703EDB 0%, #EA8CFF 60%, #0C76FF 100%), #37303F;"
        >
          <div class="h-[40px] w-[134px]" flex="~ justify-center items-center">
            <div text="#E0E0E0 16px">AI Coach</div>
          </div>
        </div>
      </template>
      <template #default>
        <div class="rounded-[16px] bg-[#43404B]" border="1px solid #5E5A68">
          <div class="w-full p-[20px]" flex="~" text="#CBCACC">
            <div flex="1">
              <div text="18px #fff" font="500">AI Coach</div>
              <div class="max-h-[260px] w-full overflow-y-auto">
                <div
                  flex="~ justify-start items-center w-full"
                  class="mt-[20px] cursor-pointer"
                >
                  <img
                    class="mr-[20px] h-[40px] w-[40px] flex-shrink-0 rounded-[6px]"
                  />
                  <div text="16px">
                    How to tell my family that l'm coming out?
                  </div>
                </div>
                <div
                  flex="~ justify-start items-center"
                  class="mt-[20px] cursor-pointer"
                >
                  <img
                    class="mr-[20px] h-[40px] w-[40px] flex-shrink-0 rounded-[6px]"
                  />
                  <div text="16px">
                    How to deal with others' strange looks and doubts?
                  </div>
                </div>
                <div
                  flex="~ justify-start items-center"
                  class="mt-[20px] cursor-pointer"
                >
                  <img
                    class="mr-[20px] h-[40px] w-[40px] flex-shrink-0 rounded-[6px]"
                  />
                  <div text="16px">
                    How to help parents accept your sexual orientation?
                  </div>
                </div>
                <div
                  flex="~ justify-start items-center"
                  class="mt-[20px] cursor-pointer"
                >
                  <img
                    class="mr-[20px] h-[40px] w-[40px] flex-shrink-0 rounded-[6px]"
                  />
                  <div text="16px">
                    How to express love to the same-sex person you like?
                  </div>
                </div>
              </div>
            </div>
            <div class="mx-[24px] w-[1px] bg-[#5E5A68]"></div>
            <div class="w-[180px]">
              <div text="18px #fff" font="500">Other Features</div>
              <div class="max-h-[260px] w-full w-full overflow-y-auto">
                <div
                  flex="~ justify-start items-center w-full"
                  class="mt-[20px] cursor-pointer"
                >
                  <img
                    class="mr-[12px] h-[24px] w-[24px] flex-shrink-0"
                  />
                  <div text="16px">
                    Word Cloud
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<style lang="scss" scoped>
.coach-select {
  :deep(.el-popper) {
    padding: 0 !important;
  }
}
</style>
