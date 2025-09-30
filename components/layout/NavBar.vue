<script setup lang="ts">
import { openLoginModal } from '@/components/modal/login/open'
import { useView } from '@/hooks'
import { Expand, Fold } from '@element-plus/icons-vue'
import { ElMenuItem, ElSubMenu } from 'element-plus'
import { storeToRefs } from 'pinia'
import logoBlack from '~/assets/images/logo/black.png'
import logoGreen from '~/assets/images/logo/green.png'
import logoWhite from '~/assets/images/logo/white.png'
import { openContactModal } from '../modal/contact/open'
import { openSettingModal } from '../modal/setting/open'
import ProductPopover from './ProductPopover.vue'
import UserPopover from './UserPopover.vue'

const props = withDefaults(defineProps<Props>(), {
  logo: 'green',
  width: '100%',
  isAbsolute: false,
  fixed: false,
  routeList: () => [],
})

const cMap = {
  product: ProductPopover,
}

interface Props {
  logo?: string
  width?: string
  isAbsolute?: boolean
  fixed?: boolean
  routeList: any[]
}

const Logo = {
  green: logoGreen,
  white: logoWhite,
  black: logoBlack,
  none: '',
}

const route = useRoute()

const getActive = (item: any) => {
  if (isArray(item.routeName)) {
    return item.routeName.includes(route.name)
  }
  return route.name === item.routeName
}

const logoImg = computed(() => Logo[props.logo as keyof typeof Logo])

const userStore = useUserStore()
const { getToken } = storeToRefs(userStore)

const router = useRouter()
const handleSelect = (name: string) => {
  // 获取到routeList中name相同的item，递归
  const getItme = (item: any[]) => {
    if (item.length === 0) return null
    for (const i of item) {
      if (i.routeName === name) {
        return i
      }
      else if (i.children) {
        const res = getItme(i.children)
        if (res) return res
      }
    }
  }
  const item = getItme(props.routeList)
  router.push({ path: item?.path || '/' })
}

const handleLogout = () => {
  modal('Confirm logout？', '', {
    confirmButtonText: 'Ok',
    autoClose: true,
  }).then(async ({ loadingConfirm, closeModal }) => {
    loadingConfirm(true)
    userStore
      .logout()
      .then(() => {
        message('Logout success', { type: 'success' })
        closeModal()
      })
      .finally(() => {
        loadingConfirm(true)
      })
  })
}

const useCollapsed = () => {
  const isCollapsed = ref(false)
  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
    updateNavbarStyles()
  }
  return {
    isCollapsed,
    toggleCollapse,
  }
}

const { isCollapsed, toggleCollapse } = useCollapsed()
const { isMobile } = useView()
const useGlass = () => {
  const navbar = ref<HTMLElement | null>(null)
  // 滚动位置和透明度
  const scrollPosition = ref(0)
  const glassOpacity = computed(() => {
    // 0-84px 范围内透明度从 0 到 0.2 平滑过渡
    return Math.min(0.2, Math.max(0, scrollPosition.value / 600))
  })

  const updateNavbarStyles = () => {
    if (!navbar.value) return

    // 移除固定类，使用计算属性控制
    navbar.value.classList.remove('glass-effect', 'is-sticky', 'is-absolute')

    // 应用动态样式
    if (scrollPosition.value > 0 || isCollapsed.value) {
      if (props.isAbsolute && scrollPosition.value === 0) {
        navbar.value.classList.add('is-absolute')
      }

      // 添加玻璃效果类，透明度由CSS变量控制
      // if (isMobile.value) {
      //   navbar.value.classList.add('glass-effect')
      // }

      navbar.value.style.setProperty(
        '--glass-opacity',
        glassOpacity.value.toString(),
      )
    }
    else {
      if (props.isAbsolute) {
        navbar.value.classList.add('is-absolute')
      }
    }
  }

  const handleScroll = () => {
    scrollPosition.value = window.scrollY
    updateNavbarStyles()
  }

  onMounted(() => {
    navbar.value = document.querySelector('#navbar') as HTMLElement
    if (import.meta.client) {
      scrollPosition.value = window.scrollY
      nextTick(updateNavbarStyles)
      window.addEventListener('scroll', handleScroll)
    }
  })

  onBeforeUnmount(() => {
    if (import.meta.client) {
      window.removeEventListener('scroll', handleScroll)
    }
  })

  return {
    updateNavbarStyles,
    navbar,
  }
}

const { updateNavbarStyles } = useGlass()
</script>

<template>
  <div
    id="navbar"
    class="w-full"
    :class="{
      'is-absolute': props.isAbsolute,
      'fixed': props.fixed,
    }"
  >
    <div
      class="seein-nav__wrapper relative"
      z-99
      w-full
      flex
      items-center
      justify-center
    >
      <div class="seein-nav z-188 flex items-center justify-between">
        <div flex="~ items-center justify-center">
          <NuxtLink
            v-if="logoImg"
            to="/"
            class="seein-nav__logo flex items-center justify-center pr-[12px]"
          >
            <img :src="logoImg" alt="logo" />
          </NuxtLink>
          <slot name="left" />
        </div>

        <div class="seein-nav__links">
          <div md:flex>
            <UiCard
              v-if="routeList.length"
              :radius="70"
              border-color="conic-gradient(
                from 0deg at 50% 50%,
                rgba(106, 78, 167, 0) 0%,
                #6a4ea7 25%,
                rgba(106, 78, 167, 0) 50%,
                #6a4ea7 100%
              )"
            >
              <div class="seein-nav__links-left">
                <el-popover
                  v-for="item in routeList"
                  :key="item.name"
                  popper-style="z-index: 188;width: auto;border: 1px solid #C8D9CC;border-radius: 20px;"
                  :disabled="!item.component"
                >
                  <template #reference>
                    <NuxtLink
                      class="seein-nav__links-left--item z-109"
                      :class="{ active: getActive(item) }"
                      :to="item.path"
                      @click="item.onClick"
                    >
                      <UiTextLink :content="item.name" />
                    </NuxtLink>
                  </template>
                  <template #default>
                    <component :is="cMap[item.component]" />
                  </template>
                </el-popover>
                <el-popover
                  :show-arrow="false"
                  :offset="6"
                  :z-index="100"
                  trigger="hover"
                  placement="bottom-end"
                  popper-style="z-index: 188;padding: 4px;width: auto;border-radius: 12px;"
                >
                  <template #reference>
                    <div class="z-99 cursor-pointer">
                      <img
                        class="seein-nav__links-right--avatar"
                        src="@/assets/images/avatar.png"
                        alt="avatar"
                      />
                    </div>
                  </template>
                  <template #default>
                    <UserPopover
                      @logout="handleLogout"
                      @setting="openSettingModal"
                      @contact="openContactModal"
                    />
                  </template>
                </el-popover>
              </div>
            </UiCard>
          </div>

          <div class="seein-nav__links-right md:hidden">
            <div>
              <button
                class="flex items-center rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                @click="toggleCollapse"
              >
                <el-icon
                  v-if="isCollapsed"
                  class="h-[30px] w-[30px] text-gray-500"
                >
                  <Expand class="h-[24px] w-[24px]" />
                </el-icon>
                <el-icon v-else class="h-[30px] w-[30px] text-gray-500">
                  <Fold class="h-[24px] w-[24px]" />
                </el-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Transition name="dropdown">
      <div
        v-if="isCollapsed"
        style="width: 100%"
        class="absolute left-0 top-0 z-[98]"
      >
        <div class="bg-white p-[16px] pt-[84px]">
          <el-menu
            :default-active="String(route.name)"
            unique-opened
            @select="handleSelect"
          >
            <template v-for="item in routeList" :key="item.name">
              <component
                :is="
                  item.children && item.children.length ? ElSubMenu : ElMenuItem
                "
                :index="item.routeName"
              >
                <template #title>{{ item.name }}</template>
                <template v-if="item.children && item.children.length">
                  <ElMenuItem
                    v-for="child in item.children"
                    :key="child.name"
                    :index="child.routeName"
                  >
                    <template #title>{{ child.name }}</template>
                  </ElMenuItem>
                </template>
              </component>
            </template>
          </el-menu>
          <div class="mt-[16px]">
            <div class="mb-[16px] h-[1px] w-full bg-gray-300"></div>
            <NuxtLink
              v-if="!getToken"
              class="seein-nav__links-left--item-mobile"
              @click="openLoginModal"
            >
              登录/注册
            </NuxtLink>
            <div v-else class="pl-[8px]">
              <UserPopover
                @logout="handleLogout"
                @setting="openSettingModal"
                @contact="openContactModal"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <Transition name="mask">
      <div v-if="isCollapsed" class="mask" @click="toggleCollapse" />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.seein-nav {
  width: v-bind("width");
  padding: 16px 40px;

  &__logo {
    border-radius: 32px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 20px;
    img {
      width: 103px;
      height: 32px;
      object-fit: cover;
    }
  }

  &__links {
    display: flex;
    align-items: center;

    &-left {
      padding: 8px;
      border-radius: 32px;
      display: flex;
      justify-content: center;
      align-items: center;
      &--item {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 21px;
        color: $color-text-1;
        height: 46px;
        font-size: 14px;
        color: #ffffff;
        &.active {
          color: #ffffff;
          font-weight: 500;
        }

        &:hover {
          color: #ffffff;
        }
      }

      &--item-mobile {
        display: flex;
        align-items: center;
        justify-content: left;
        padding: 0 24px;
        color: $color-text-1;
        height: 42px;
        font-size: 14px;

        &.active {
          color: #007b43;
          font-weight: 500;
        }

        &:hover {
          color: $brand-1;
        }
      }
    }

    &-right {
      margin-left: 12px;

      &--item {
        border-radius: 32px;
        padding: 0 36px;
        transition: background 0.2s ease-in-out;
        color: $color-text-1;
        height: 49px;
        display: flex;
        align-items: center;
        font-size: 14px;
        cursor: pointer;

        &:hover {
          color: $brand-1;
        }
      }

      &--avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin-right: 6px;
      }
    }
  }
}

.mask {
  position: absolute;
  top: 86px;
  left: 0;
  height: 100vh;
  width: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.seein-nav__links-left--item-mobile {
  display: flex;
  align-items: center;
  justify-content: left;
  padding: 0 20px;
  border-radius: 12px;
  transition: background 0.2s ease-in-out;
}

.is-absolute {
  position: absolute;
  top: 0;
  z-index: 99;
}
.is-sticky {
  position: sticky;
  top: 0;
  z-index: 99;
}

:deep(.el-menu) {
  border-right: unset !important;
}

:deep(.el-menu-item.is-active) {
  color: #007b43 !important;
  font-weight: 500;
}

/* 下拉菜单过渡效果 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.dropdown-enter-from,
.dropdown-leave-to {
  max-height: 0;
  transform: translateY(-10px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  max-height: 500px;
  transform: translateY(0);
}

/* 遮罩层过渡效果 */
.mask-enter-active,
.mask-leave-active {
  transition: opacity 0.3s ease;
}

.mask-enter-from,
.mask-leave-to {
  opacity: 0;
}

.mask-enter-to,
.mask-leave-from {
  opacity: 1;
}
</style>
