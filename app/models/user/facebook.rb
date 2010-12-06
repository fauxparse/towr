class User::Facebook < ActiveRecord::Base
  set_table_name :facebook_authentications
  
  belongs_to :user, :inverse_of => :facebook
  
  def self.[](info)
    find_by_facebook_id(info["id"]) ||
    create({
      :facebook_id => info["id"],
      :user => User.create(:name => info["name"], :email => info["email"], :link => info["link"])
    })
  end
end