/**
 * Created by Administrator on 2017/9/30.
 */
var app = angular.module('MyApp', ['ngRoute'])
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: "./views/home.html",
            controller: "homeCtrl"
        })
        .when('/categories', {
            templateUrl: './views/categories.html',
            controller: "categoriesCtrl"
        })
        .when('/cart', {
            templateUrl: './views/cart.html',
            controller: "cartCtrl"
        })
        .when('/mine', {
            templateUrl: './views/mine.html',
            controller: "mineCtrl"
        })
        .when('/search', {
            templateUrl: './views/search.html',
            controller: "searchCtrl"
        })
        .when('/homeProDetail/:id', {
            templateUrl: './views/homeProDetail.html',
            controller: "homeProDetailCtrl"
        })
        .when('/cgrProDetail/:id', {
            templateUrl: './views/cgrProDetail.html',
            controller: "cgrProDetailCtrl"
        })
        .when('/map', {
            templateUrl: './views/map.html',
            controller: "mapCtrl"
        })
        .otherwise({
            redirectTo: '/home'
        })
}])
// 首页
app.controller("homeCtrl", ["$scope", "$http", "$rootScope", "cartService", function ($scope, $http, $rootScope, cartService) {
    $http.get("./json/home_.json").success(function (data) {
        $rootScope.rollPic = data.rollImg
        $rootScope.nav = data.nav
        $rootScope.recommend1 = data.recommend1
        $scope.market = data.recommend2[0]
        $scope.new = data.recommend2[1]
        $scope.hot = data.recommend2[2]
        $scope.recNav = data.recommend2[3].rec_nav
        $rootScope.recAd = data.recommend2[4].rec_ad
        $rootScope.partPro = data.partPro
    })
    // 添加商品到购物车
    $scope.shop = function (item) {
        cartService.addProduct(item)
    }
}])
// 商品分类页
app.controller("categoriesCtrl", ["$scope", "$http", "$rootScope", "cartService", "saveDataService", function ($scope, $http, $rootScope, cartService, saveDataService) {
    if (saveDataService.getCategories().length > 0) {
        $scope.setIndex = 0
        $scope.cgrList = saveDataService.getCategories()
        $scope.cgrCids = saveDataService.getCategories()[0].cids
        $rootScope.proList = saveDataService.getProducts()[104747]
    } else {
        // 获取数据
        $http.get("./json/categories_.json").success(function (data) {
            $scope.setIndex = 0                         //侧边栏黄块
            $scope.cgrList = data.categories            //初始化数据  分类大纲
            $scope.cgrCids = data.categories[0].cids    //初始化数据  分类选择
            $rootScope.proList = data.products[104747]  //初始化数据  产品列表
            // 将数据存储到 saveDataService 里
            saveDataService.setCategories(data.categories)
            saveDataService.setProducts(data.products)
        })
    }
    // 显示侧边黄块
    $scope.showYlw = function (index, id) {
        $scope.setIndex = index
        $scope.cgrCids = saveDataService.getCategories()[index].cids
        $rootScope.proList = saveDataService.getProducts()[id]
        $scope.key = "全部分类"         // 切换类别时 重置这两个值
        $scope.rank = "综合排序"
    }

    $scope.key = "全部分类"      // 激活的子分类的关键字
    $scope.rank = "综合排序"     // 激活的排序的关键字
    // 排序的方式
    $scope.ranking = [
        {name: "综合排序"},
        {name: "价格最高"},
        {name: "价格最低"}
    ]
    // 子分类
    $scope.assort = function (item) {
        $scope.key = item.name
        $scope.showLBol = false
    }
    // 排序
    $scope.sort = function (item) {
        $scope.rank = item.name
        $scope.showRBol = false
        if ($scope.rank === '价格最高') {
            $scope.orderBol = true
        } else {
            $scope.orderBol = false
        }
    }
    // 过滤关键字所对应的商品
    $scope.filterItem = function (item) {
        item.price = Number(item.price)
        if ($scope.key === '全部分类') {
            return true
        } else {
            return item.cids[item.child_cid] === $scope.key
        }
    }

    // 右边 tab 效果 & 显示与隐藏
    $scope.showLBol = false
    $scope.showRBol = false
    $scope.sortL = function () {
        $scope.showRBol = false
        $scope.showLBol = !$scope.showLBol
    }
    $scope.sortR = function () {
        $scope.showLBol = false
        $scope.showRBol = !$scope.showRBol
    }
    // 添加商品到购物车
    $scope.shop = function (item) {
        cartService.addProduct(item)
    }
    // 移除商品
    $scope.cancelS = function (item) {
        cartService.subProduct(item)
    }
}])
// 购物车页
app.controller("cartCtrl", ["$scope", "cartService", function ($scope, cartService) {
    $scope.cartBol = true
    $scope.cartArr = cartService.getProduct()
    //记录商品的总价
    $scope.totalPrice = 0
    for (var i = 0; i < $scope.cartArr.length; i++) {
        if ($scope.cartArr[i].checkedBol)
            $scope.totalPrice += parseFloat($scope.cartArr[i].price) * parseFloat($scope.cartArr[i].pre_state)
    }
    //点击 "+" 按钮
    $scope.shop = function (item) {
        cartService.addProduct(item)
        $scope.totalPrice += parseFloat(item.price)
    }
    //点击 "-" 按钮
    $scope.cancelS = function (item) {
        cartService.subProduct(item)
        $scope.totalPrice -= parseFloat(item.price)
    }
    // 勾选单个商品
    $scope.select = function (item) {
        item.checkedBol = !item.checkedBol
        if (!item.checkedBol) {
            $scope.totalPrice -= parseFloat(item.price) * parseFloat(item.pre_state)
        }
        else {
            $scope.totalPrice += parseFloat(item.price) * parseFloat(item.pre_state)
        }
        cartService.setProNum()
    }
    // 勾选全部商品
    $scope.selectAllBol = function () {
        for (var i = 0; i < $scope.cartArr.length; i++) {
            if (!$scope.cartArr[i].checkedBol) {
                return false
                break
            }
        }
        return true
    }
    $scope.selectAll = function () {
        if (parseInt($scope.totalPrice) > 0)
            $scope.totalPrice = 0
        for (var i = 0; i < $scope.cartArr.length; i++)
            $scope.cartArr[i].checkedBol = !$scope.cartArr[i].checkedBol
        if ($scope.selectAllBol()) {
            for (var i = 0; i < $scope.cartArr.length; i++)
                $scope.totalPrice += parseFloat($scope.cartArr[i].price) * parseFloat($scope.cartArr[i].pre_state)
        }
        cartService.setProNum()
    }
    // 初始化送货时间
    $scope.value = "30分钟送达"
}])
// 我的页
app.controller("mineCtrl", ["$scope", function ($scope) {

}])
// 地图页
app.controller("mapCtrl", ["$scope", "$window", "$http", "$location", function ($scope, $window, $http, $location) {
    $scope.mapOptions = {"lng": 1, "lat": 1}
    $scope.addressBol = true
    $scope.title = "选择地址"
    // 添加地址
    $scope.add = function () {
        $scope.addressBol = false
        $scope.title = "添加地址"
    }
    $scope.manBol = false
    $scope.man = function () {
        $scope.manBol = !$scope.manBol
        $scope.womanBol = false
    }
    $scope.womanBol = false
    $scope.woman = function () {
        $scope.womanBol = !$scope.womanBol
        $scope.manBol = false
    }
    $scope.value = "请选择城市"
    // 获取用户地址信息
    $http.get("./json/userAddress_.json").success(function (data) {
        $scope.userMsg = data
    })
    // 保存添加的地址
    $scope.save = function (name, tel, value, house, number) {
        $scope.addressBol = true
        var msg = {
            name: name,
            tel: tel,
            city: value,
            house: house,
            number: number
        }
        $scope.userMsg.push(msg)
    }
    // 修改地址
    $scope.edit = function (index) {
        $scope.userMsg.splice(index, 1)
        $scope.addressBol = false
        $scope.title = "修改地址"
    }
    // 显示高德地图
    $scope.mapBol = false
    $scope.showMap = function () {
        $scope.mapBol = true
    }
    $scope.back = function () {
        $window.history.back()
    }
}])
// 搜索页
app.controller("searchCtrl", ["$scope", "$window", function ($scope, $window) {
    $scope.back = function () {
        $window.history.back()
    }
}])
// 首页_商品详情页
app.controller("homeProDetailCtrl", ["$scope", "$routeParams", "$rootScope", "$window", "cartService", function ($scope, $routeParams, $rootScope, $window, cartService) {
    var id = $routeParams.id
    // 轮播图
    for (var i = 0; i < $rootScope.rollPic.length; i++) {
        if ($rootScope.rollPic[i].id === id) {
            $scope.title = $rootScope.rollPic[i].name
            $scope.img = $rootScope.rollPic[i].img
        }
    }
    // nav
    for (var i = 0; i < $rootScope.nav.length; i++) {
        if ($rootScope.nav[i].id === id) {
            $scope.title = $rootScope.nav[i].name
            $scope.img = $rootScope.nav[i].detailImg
        }
    }
    // recommend1
    for (var i = 0; i < $rootScope.recommend1.length; i++) {
        if ($rootScope.recommend1[i].id === id) {
            $scope.title = $rootScope.recommend1[i].name
            $scope.img = $rootScope.recommend1[i].detailImg
        }
    }
    // recAd
    for (var i = 0; i < $rootScope.recAd.length; i++) {
        if ($rootScope.recAd[i].activity.id === id) {
            $scope.title = $rootScope.recAd[i].activity.name
            $scope.img = $rootScope.recAd[i].activity.detailImg
        }
    }
    // partPro
    for (var i = 0; i < $rootScope.partPro.length; i++) {
        for (var j = 0; j < $rootScope.partPro[i].category_detail.goods.length; j++) {
            if ($rootScope.partPro[i].category_detail.goods[j].id === id) {
                $scope.item = $rootScope.partPro[i].category_detail.goods[j]
                $scope.title = $rootScope.partPro[i].category_detail.goods[j].name
                $scope.img = $rootScope.partPro[i].category_detail.goods[j].img
                $scope.netW = $rootScope.partPro[i].category_detail.goods[j].specifics
                $scope.price = $rootScope.partPro[i].category_detail.goods[j].price
                $scope.market_price = $rootScope.partPro[i].category_detail.goods[j].market_price
                $scope.num = $rootScope.partPro[i].category_detail.goods[j].pre_state
            }
        }
    }
    // 添加商品到购物车
    $scope.shop = function () {
        cartService.addProduct($scope.item)
        $scope.num++
    }
    // 移除商品
    $scope.cancelS = function () {
        cartService.subProduct($scope.item)
        $scope.num--
        if ($scope.num === 0)
            $scope.num = 0
    }
    $scope.back = function () {
        $window.history.back()
    }
}])
// 商品分类页_商品详情页
app.controller("cgrProDetailCtrl", ["$scope", "$routeParams", "$rootScope", "$window", "cartService", function ($scope, $routeParams, $rootScope, $window, cartService) {
    var id = $routeParams.id
    // proList
    for (var i = 0; i < $rootScope.proList.length; i++) {
        if ($rootScope.proList[i].id === id) {
            $scope.item = $rootScope.proList[i]
            $scope.title = $rootScope.proList[i].name
            $scope.img = $rootScope.proList[i].img
            $scope.netW = $rootScope.proList[i].specifics
            $scope.price = $rootScope.proList[i].price
            $scope.market_price = $rootScope.proList[i].market_price
            $scope.num = $rootScope.proList[i].pre_state
        }
    }
    // 添加商品到购物车
    $scope.shop = function () {
        cartService.addProduct($scope.item)
        $scope.num++
    }
    // 移除商品
    $scope.cancelS = function () {
        cartService.subProduct($scope.item)
        $scope.num--
        if ($scope.num === 0)
            $scope.num = 0
    }
    $scope.back = function () {
        $window.history.back()
    }
}])
// tab bar 切换的效果
// 判断 path
app.run(["$rootScope", "$location", function ($rootScope, $location) {
    $rootScope.show = $rootScope.$on("$locationChangeSuccess", function () {
        $rootScope.home = function () {
            if ($location.path() !== '/home')
                return false
            else
                return true
        }
        $rootScope.cgr = function () {
            if ($location.path() === '/categories')
                return false
            else
                return true
        }
        $rootScope.cart = function () {
            if ($location.path() === '/cart')
                return false
            else
                return true
        }
        $rootScope.mine = function () {
            if ($location.path() === '/mine')
                return false
            else
                return true
        }
    })
    // 初始化tabBarBol为true
    $rootScope.tabBarBol = true
    // $locationChangeSuccess事件->在当浏览器地址发生改变的时候触发
    $rootScope.$on("$locationChangeSuccess", function () {
        // 在浏览器路径查找到了search
        if ($location.path().indexOf('search') !== -1 ||
            $location.path().indexOf('homeProDetail') !== -1 ||
            $location.path().indexOf('cgrProDetail') !== -1 ||
            $location.path().indexOf('map') !== -1) {
            $rootScope.tabBarBol = false
        } else {
            $rootScope.tabBarBol = true
        }
    })
}])
// 自定义服务-向购物车添加商品
app.factory("cartService", ["$rootScope", "$timeout", function ($rootScope, $timeout) {
    var cartArr = []        //  购物车商品数据
    function resetProductNum() {
        // 统计购物车商品数量
        var result = 0
        for (var i = 0; i < cartArr.length; i++) {
            if (cartArr[i].checkedBol)
                result += cartArr[i].pre_state
        }
        $rootScope.productNum = result
        // 动画-购物车数量
        $rootScope.numZoomActive = true
        $timeout(function () {
            $rootScope.numZoomActive = false
        }, 200)
    }

    return {
        // 获取购物车数据
        getProduct: function () {
            return cartArr
        },
        // 商品总数动画
        setProNum: function () {
            resetProductNum()
        },
        // 购物车中添加商品
        addProduct: function (item) {
            //判断是否需要追加
            var addedToExistingItem = false
            for (var i = 0; i < cartArr.length; i++) {
                if (cartArr[i].id == item.id) {
                    //如果已有的话便将数量（pre_state）++
                    cartArr[i].pre_state++
                    addedToExistingItem = true
                    break
                }
            }
            if (!addedToExistingItem) {
                item.pre_state++
                item.checkedBol = true
                cartArr.push(item)
            }
            resetProductNum()
        },
        // 减少商品数量
        subProduct: function (item) {
            for (var i = 0; i < cartArr.length; i++) {
                if (cartArr[i].id == item.id) {
                    cartArr[i].pre_state--
                    // 如果小于1等于0就移除掉
                    if (cartArr[i].pre_state <= 0) {
                        cartArr.splice(i, 1)
                    }
                    break
                }
            }
            resetProductNum()
        }
    }
}])
// 自定义服务-保存数据
app.factory("saveDataService", [function () {
    // 分类数据
    var categories = []
    // 所有商品数据
    var products = {}
    return {
        // 获取分类
        getCategories: function () {
            return categories
        },
        // 设置分类
        setCategories: function (arg) {
            categories = arg
        },
        // 获取所有商品数据
        getProducts: function () {
            return products
        },
        // 设置所有商品数据
        setProducts: function (arg) {
            products = arg
        }
    }
}])
// 高德地图
app.directive('gaodeMap', [function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<div id="container"></div>',
        scope: {
            options: '='
        },
        link: function ($scope, ele, attr) {
            var map = new AMap.Map("container", {
                resizeEnable: true,
                zoom: 13
            })
            // var marker = new AMap.Marker({
            //     map : map,
            //     bubble : true ,
            //     content: '<div class="marker-route marker-marker-bus-from"></div>'  //自定义点标记覆盖物内容
            // })
            // marker.setLabel({
            //     offset: new AMap.Pixel(0, 0),
            //     content: "我在这里"
            // })
            $scope.$watch("options", function (newValue, oldValue) {
                if ($scope.options && $scope.options.lng && $scope.options.lat) {
                    map.setCenter([$scope.options.lng, $scope.options.lat]);
                    marker.setPosition([$scope.options.lng, $scope.options.lat]);
                }
            }, true);
        }
    }

}])


