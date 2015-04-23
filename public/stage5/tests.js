'use strict';

describe('ステージ5（意図通りに非同期処理を利用できる）', function() {
  describe('Promise 編', function() {
    it('resolve ハンドラーを書ける', function(testDone){
      var promise = Promise.resolve('resolved!');

      // チュートリアル
      //
      // ここに下記のコードを記述してください。
      //
      promise.then(function(msg) {
        expect(msg).to.equal('resolved!');
        testDone();
      });
    });


    it('reject ハンドラーを書ける', function(testDone){
      var promise = Promise.reject('rejected!');

      // reject ハンドラーを使って、下の assertion が promise の
      // エラー値を検証できるように記述してください。
      //
      // expect(msg).to.equal('rejected!');
      // testDone();

      // ここにコードを記述してください。
      promise.catch(function(msg){
	expect(msg).to.equal('rejected!');
	testDone();
      });

    });


    it('複数の promise すべての完了を待つ promise を作成できる', function() {
      var messageFragments = ['あなたと', 'java', '今すぐダウンロード'];
      var promise1 = createWaitPromise(messageFragments[0], 10);
      var promise2 = createWaitPromise(messageFragments[1], 20);
      var promise3 = createWaitPromise(messageFragments[2], 30);

      // 作成した promise を promise 変数に代入してください。
      var promise = Promise.all([promise1, promise2, promise3]);

      return expect(promise).to.eventually.deep.equal(messageFragments);
    });


    it('複数の promise のうち最も速く解決された値をもつ promise を作成できる', function() {
      var messageFragments = ['30億の', 'デバイスで', '走るjava'];
      var promise1 = createWaitPromise(messageFragments[0], 30);
      var promise2 = createWaitPromise(messageFragments[1], 10);
      var promise3 = createWaitPromise(messageFragments[2], 30);

      // 作成した promise を promise 変数に代入してください。
      var promise = Promise.race([promise1, promise2, promise3]);

      return expect(promise).to.eventually.equal(messageFragments[1]);
    });
  });


  describe('fetch API 編', function() {
    it('/api/friends API を使って Sugar の友人を取得できる', function() {
      var api = '/api/friends/';
      var username = 'Sugar';

      // チュートリアル
      //
      // ここに下記のコードを記述してください。
      //
      var promisedFriends = fetch(api + username).then(function(res) {
        return res.json();
      });


      return expect(promisedFriends).to.eventually.have.length(1)
        .and.have.members(['PYXC-PJ']);
    });


    it('/api/friends API を使って Shen の友人を取得できる', function() {
      var api = '/api/friends/';
      var username = 'Shen';

      // 作成した promise を promisedFriends 変数に代入してください。
	var promisedFriends = fetch(api + username).then(function(res){
	    return res.json();
	});

	return expect(promisedFriends).to.eventually.have.length(2)
        .and.have.members(['jisp', 'TeJaS']);
    });

    it('/api/friends API を使って Shen の友人の友人を取得できる', function() {
      var api = '/api/friends/';
      var username = 'Shen';

	// 作成した promise を promisedFriends 変数に代入してください。
	var getFriends = function(friendName){
	    return fetch(api + friendName)
		.then(function(res){ return res.json(); });
	};

	var promisedFriends = getFriends(username)
	 .then(function(friends){
	     return Promise.all($.map(friends, getFriends));
	 })
	 .then(function(responses){
	     // flatten
	     return $.map(responses, function(response){ return response; });
	 });

      return expect(promisedFriends).to.eventually.have.length(1)
        .and.have.members(['TypeScript']);
    });

    it('/api/friends API を使って CoffeeScript の友人を再帰的に取得できる', function() {
      // 難易度高いので、自信のある人だけ挑戦してください。
	// it.skip の .skip を消せば、テストが走るようになります。

	// 1. ユーザー名リストから、全員分の友人を取る
	// 2. まだ名前を知らない友人のみ新たな友人として追加する
	// 3. 新たな友人を1にかける

	// 作成した promise を promisedFriends 変数に代入してください。
	var api = '/api/friends/';
	var username = "CoffeeScript";
	var getFriendsRecursively = function(firstUserName) {
	    var allFriends = [];
	    
	    var getFriends = function(friendName){
		return fetch(api + friendName)
		    .then(function(res){ return res.json(); });
	    };
	    var flatten = function(array){
		return $.map(array, function(arrayOrElement){ return arrayOrElement; });
	    };
	    var isUnknownFriend = function(name) {
		return $.inArray(name, allFriends) === -1;
	    };

	    var iterFunc = function(newFriends){
		if (!newFriends.length) {
		    return allFriends;
		}
		return Promise.all($.map(newFriends, getFriends))
		    .then(function(friendsDeepArray){
			var nextNewFriends = flatten(friendsDeepArray).filter(isUnknownFriend);
			allFriends = allFriends.concat(nextNewFriends);
			return nextNewFriends;
		    }).then(iterFunc);
	    };
	    return iterFunc([firstUserName]);
	};

	var promisedFriends = getFriendsRecursively(username);

      return expect(promisedFriends).to.eventually.have.length(5)
        .and.have.members([
          'Taijilang',
          'purescript',
          'Wind.js',
          'ScriptBlocks',
          'jangaroo'
        ]);
    });


    it('Github の mixi-inc の organization の情報を取得できる', function() {

	// 作成した promise を mixiOrg 変数に代入してください。
	var api = "https://api.github.com/orgs/";
	var orgName = "mixi-inc";
	var mixiOrg = fetch(api + orgName)
	 .then(function(res){
	     return res.json();
	 });

      return expect(mixiOrg).to.eventually.have.property('id', 1089312);

      // Github API に関する参考情報
      // https://developer.github.com/v3/orgs
    });


    it('Github API を使って、mixi-inc/JavaScriptTraining の情報を取得できる', function() {
      var repository = 'mixi-inc/JavaScriptTraining';

      // 作成した promise を mixiRepo 変数に代入してください。
	var api = "https://api.github.com/repos/";
	var orgName = "mixi-inc/JavascriptTraining";
	var mixiRepo = fetch(api + orgName)
	 .then(function(res){
	     return res.json();
	 });


      return expect(mixiRepo).to.eventually.have.property('full_name', repository);

      // Github API に関する参考情報
      // https://developer.github.com/v3/repos/
    });


    it('Github API を使って、VimL、Emacs Lisp でスターが最も多いプロダクト名を' +
       'それぞれ 1 つずつ取得できる', function() {
	   var api = "https://api.github.com/search/repositories";
      var languages = [ 'VimL', '"Emacs Lisp"' ];
	   var mostPopularRepos = Promise.all($.map(languages, function(language){
	       return fetch(api + "?q=" + encodeURIComponent(language) + "&sort=stars&order=desc")
		   .then(function(res){
		       return res.json();
		   })
		   .then(function(info){
		       return info.items[0].name;
		   });
	   }));

      // 作成した promise を mostPopularRepos 変数に代入してください。


      return expect(mostPopularRepos).to.eventually.have.length(2)
        .and.satisfy(function(names) {
          return typeof names[0] === 'string' &&
            typeof names[1] === 'string';
        });

      // Github API に関する参考情報
      // https://developer.github.com/v3/search
    });
  });


  function createWaitPromise(value, msec) {
    return new Promise(function(resolve) {
      setTimeout(resolve, msec, value);
    });
  }
});
