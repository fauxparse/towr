class User::Twitter < ActiveRecord::Base
  set_table_name :twitter_authentications
  
  belongs_to :user
  
  def self.[](info)
    find_by_twitter_id(info["id"]) ||
    create({
      :twitter_id => info["id"],
      :screen_name => info["screen_name"],
      :user => User.create(:name => info["name"])
    })
  end
  
  def link
    "http://twitter.com/#{screen_name}"
  end
end