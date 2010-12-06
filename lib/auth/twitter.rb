module Auth
  class Twitter
    attr_accessor :controller
    
    delegate :params, :login_callback_url, :to => :controller
    
    def initialize(controller)
      @controller = controller
    end
    
    def consumer
      @consumer ||= OAuth::Consumer.new(ENV['TWITTER_KEY'], ENV['TWITTER_SECRET'], { :site => "http://twitter.com" })
    end
    
    def session
      controller.session[:twitter] ||= HashWithIndifferentAccess.new
    end
    
    def authentication_url(callback_url = nil)
      controller.session.delete :twitter
      request_token = consumer.get_request_token(:oauth_callback => callback_url || login_callback_url(:twitter))
      session.update :request_token => request_token.token, :request_secret => request_token.secret
      request_token.authorize_url
    end
    
    def access_token
      if session[:access_token] and session[:access_secret]
        access_token = OAuth::AccessToken.new(consumer, session[:access_token], session[:access_secret])
      else
        session[:oauth_verifier] = params[:oauth_verifier]
        request_token = OAuth::RequestToken.new(consumer, session[:request_token], session[:request_secret])
        access_token = request_token.get_access_token(:oauth_verifier => session[:oauth_verifier])
      end

      session[:access_token], session[:access_secret] = access_token.token, access_token.secret
      access_token
    end
    
    def login
      response = consumer.request(:get, '/account/verify_credentials.json', access_token, { :scheme => :query_string, :oauth_verifier => session[:oauth_verifier] })
      if response.code == "200"
        user_info = JSON.parse(response.body)
        User::Twitter[user_info].user
      else
        false
      end
    end
    
  end
end